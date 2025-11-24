import { db } from '@/lib/db'
import { validateUrl, normalizeUrl } from '@/lib/utils'
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from '@/lib/api-response'
import * as XLSX from 'xlsx'
import { randomBytes } from 'crypto'

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret') || request.headers.get('x-admin-secret')

    // Check admin secret
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return unauthorizedResponse('Invalid or missing admin secret')
    }

    // Parse multipart form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return errorResponse('No file provided', 400, 'MISSING_FILE')
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return errorResponse('File must be an Excel file (.xlsx or .xls)', 400, 'INVALID_FILE_TYPE')
    }

    // Read file as buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Parse Excel file
    let workbook: XLSX.WorkBook
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' })
    } catch (err) {
      return errorResponse('Failed to parse Excel file', 400, 'PARSE_ERROR')
    }

    // Get first sheet
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return errorResponse('Excel file has no sheets', 400, 'NO_SHEETS')
    }

    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][]

    if (data.length === 0) {
      return errorResponse('Excel file is empty', 400, 'EMPTY_FILE')
    }

    // Find URL column
    const headerRow = data[0] || []
    let urlColumnIndex = -1

    // Try to find column named "url" (case-insensitive)
    for (let i = 0; i < headerRow.length; i++) {
      const header = String(headerRow[i]).toLowerCase().trim()
      if (header === 'url' || header === 'website' || header === 'link') {
        urlColumnIndex = i
        break
      }
    }

    // Fallback to first column if no URL column found
    if (urlColumnIndex === -1) {
      urlColumnIndex = 0
    }

    // Extract URLs from the column (skip header row if it exists)
    const urls: string[] = []
    const startRow = headerRow.length > 0 && typeof headerRow[urlColumnIndex] === 'string' && 
                     (headerRow[urlColumnIndex] as string).toLowerCase().includes('url') ? 1 : 0

    for (let i = startRow; i < data.length; i++) {
      const cellValue = data[i][urlColumnIndex]
      if (cellValue && typeof cellValue === 'string') {
        const url = cellValue.trim()
        if (url) {
          urls.push(url)
        }
      }
    }

    if (urls.length === 0) {
      return errorResponse('No URLs found in Excel file', 400, 'NO_URLS')
    }

    // Validate and normalize URLs
    const validUrls: string[] = []
    const invalidUrls: string[] = []

    for (const url of urls) {
      // Try to add https:// if no protocol
      let urlToValidate = url
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        urlToValidate = 'https://' + url
      }

      if (validateUrl(urlToValidate)) {
        const normalized = normalizeUrl(urlToValidate)
        validUrls.push(normalized)
      } else {
        invalidUrls.push(url)
      }
    }

    if (validUrls.length === 0) {
      return errorResponse('No valid URLs found in Excel file', 400, 'NO_VALID_URLS')
    }

    // Generate batch ID (simple unique identifier)
    const batchId = `batch_${Date.now()}_${randomBytes(8).toString('hex')}`

    // Create ScanJobs for valid URLs
    // Check for duplicates within this batch
    const uniqueUrls = Array.from(new Set(validUrls))
    let createdCount = 0
    let skippedCount = 0

    for (const url of uniqueUrls) {
      // Check if a ScanJob with this URL and batchId already exists
      const existing = await db.scanJob.findFirst({
        where: {
          url: url,
          batchId: batchId,
        },
      })

      if (!existing) {
        await db.scanJob.create({
          data: {
            url: url,
            status: 'pending',
            batchId: batchId,
          },
        })
        createdCount++
      } else {
        skippedCount++
      }
    }

    return successResponse({
      batchId,
      totalRows: urls.length,
      validUrls: validUrls.length,
      invalidUrls: invalidUrls.length,
      createdJobs: createdCount,
      skippedDuplicates: skippedCount,
    })
  } catch (error) {
    console.error('Error processing bulk scan upload:', error)
    return serverErrorResponse('Failed to process bulk scan upload')
  }
}

