import puppeteer from 'puppeteer'
import { CheckResult } from './checks'

interface PDFReport {
  url: string
  score: number
  summary: string
  issues: CheckResult[]
  createdAt: Date
  mobileScreenshotUrl?: string | null
}

export async function createPDF(report: PDFReport): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()

    // Generate HTML template
    const html = generateHTMLTemplate(report)

    // Wenn Screenshot vorhanden, muss der Pfad absolut sein
    // Setze baseURL für relative Pfade
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      ...(report.mobileScreenshotUrl
        ? {
            url: `file://${process.cwd()}/public/index.html`,
          }
        : {}),
    })

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    })

    await browser.close()

    return Buffer.from(pdf)
  } catch (error) {
    await browser.close()
    throw error
  }
}

function generateHTMLTemplate(report: PDFReport): string {
  // Score-Status bestimmen
  const getScoreStatus = (score: number) => {
    if (score < 70) return { label: 'Kritisch', color: '#dc2626' }
    if (score < 90) return { label: 'Mittel', color: '#f59e0b' }
    return { label: 'Gut', color: '#10b981' }
  }

  const scoreStatus = getScoreStatus(report.score)
  const scoreColor = scoreStatus.color

  // Kategorien-Labels
  const categoryLabels: Record<string, string> = {
    technical: 'Technischer Zustand',
    seo: 'Sichtbarkeit & SEO',
    legal: 'Recht & Datenschutz',
    ux: 'UX & Design',
  }

  // Issues nach Kategorien gruppieren
  const groupedIssues = report.issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = []
    }
    acc[issue.category].push(issue)
    return acc
  }, {} as Record<string, CheckResult[]>)

  // Statistiken berechnen
  const totalIssues = report.issues.length
  const criticalIssues = report.issues.filter((i) => i.severity === 'high').length
  const mediumIssues = report.issues.filter((i) => i.severity === 'medium').length
  const lowIssues = report.issues.filter((i) => i.severity === 'low').length

  // Datum formatieren
  const formattedDate = new Date(report.createdAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  // Empfehlungen generieren
  const recommendations = []
  if (criticalIssues > 0) {
    recommendations.push('Beheben Sie kritische Fehler innerhalb der nächsten 7 Tage.')
  }
  if (mediumIssues > 0) {
    recommendations.push('Optimieren Sie die Ladezeit für mobile Nutzer.')
  }
  if (report.issues.some((i) => i.category === 'legal')) {
    recommendations.push('Stellen Sie sicher, dass Impressum und Datenschutz rechtlich aktuell sind.')
  }
  if (report.issues.some((i) => i.category === 'seo')) {
    recommendations.push('Verbessern Sie Meta-Tags und Titel für bessere Sichtbarkeit in Suchmaschinen.')
  }
  if (report.score < 70) {
    recommendations.push('Planen Sie eine umfassende Überarbeitung Ihrer Website ein.')
  }
  // Fallback-Empfehlungen
  if (recommendations.length === 0) {
    recommendations.push('Führen Sie regelmäßige Audits durch, um die Qualität Ihrer Website zu erhalten.')
    recommendations.push('Achten Sie auf kontinuierliche Verbesserungen in den Bereichen Performance und UX.')
  }

  const categories = ['technical', 'seo', 'legal', 'ux'] as const

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SiteSweep Analysebericht - ${report.url}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #0A2540;
      background: #ffffff;
      font-size: 14px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 0;
    }
    
    /* Titelseite / Kopfbereich */
    .title-page {
      page-break-after: always;
      padding: 40px 0 60px;
      border-bottom: 3px solid #2EC4B6;
    }
    
    .title-header {
      text-align: center;
      margin-bottom: 50px;
    }
    
    .title-header h1 {
      font-size: 42px;
      font-weight: 700;
      color: #0A2540;
      margin-bottom: 10px;
      letter-spacing: -0.02em;
    }
    
    .title-header .subtitle {
      font-size: 18px;
      color: #6b7280;
      font-weight: 500;
      margin-bottom: 40px;
    }
    
    .title-info {
      background: #f9fafb;
      padding: 30px;
      border-radius: 8px;
      margin: 40px 0;
    }
    
    .title-info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .title-info-row:last-child {
      border-bottom: none;
    }
    
    .title-info-label {
      font-weight: 600;
      color: #6b7280;
      min-width: 150px;
    }
    
    .title-info-value {
      color: #0A2540;
      word-break: break-all;
      text-align: right;
      flex: 1;
    }
    
    .title-score {
      text-align: center;
      margin: 40px 0;
      padding: 40px;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 12px;
    }
    
    .title-score-value {
      font-size: 72px;
      font-weight: 700;
      color: ${scoreColor};
      margin-bottom: 10px;
      line-height: 1;
    }
    
    .title-score-label {
      font-size: 20px;
      color: #6b7280;
      font-weight: 500;
      margin-bottom: 15px;
    }
    
    .title-score-status {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 16px;
      font-weight: 600;
      background: ${scoreColor};
      color: white;
    }
    
    .title-screenshot {
      margin-top: 40px;
      text-align: center;
      padding: 20px;
      background: #f9fafb;
      border-radius: 8px;
    }
    
    .title-screenshot-label {
      font-size: 14px;
      color: #6b7280;
      font-weight: 600;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .title-screenshot-image {
      max-width: 300px;
      width: 100%;
      height: auto;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    /* Zusammenfassung */
    .summary-section {
      margin: 50px 0;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #0A2540;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #2EC4B6;
    }
    
    .summary-text {
      font-size: 15px;
      color: #374151;
      line-height: 1.8;
      margin-bottom: 25px;
    }
    
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-top: 25px;
    }
    
    .summary-stat {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #2EC4B6;
    }
    
    .summary-stat-label {
      font-size: 13px;
      color: #6b7280;
      font-weight: 500;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .summary-stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #0A2540;
    }
    
    .summary-stat-value.critical {
      color: #dc2626;
    }
    
    .summary-stat-value.medium {
      color: #f59e0b;
    }
    
    .summary-stat-value.low {
      color: #6b7280;
    }
    
    /* Detailanalyse */
    .detail-section {
      margin: 50px 0;
      page-break-inside: avoid;
    }
    
    .category-section {
      margin: 40px 0;
      page-break-inside: avoid;
    }
    
    .category-title {
      font-size: 20px;
      font-weight: 600;
      color: #0A2540;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .issue {
      margin: 20px 0;
      padding: 20px;
      background: #ffffff;
      border-left: 4px solid;
      border-radius: 4px;
      page-break-inside: avoid;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .issue-high {
      border-color: #dc2626;
      background: #fef2f2;
    }
    
    .issue-medium {
      border-color: #f59e0b;
      background: #fffbeb;
    }
    
    .issue-low {
      border-color: #9ca3af;
      background: #f9fafb;
    }
    
    .issue-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    
    .issue-title {
      font-size: 16px;
      font-weight: 600;
      color: #0A2540;
      flex: 1;
    }
    
    .severity-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .severity-high {
      background: #dc2626;
      color: white;
    }
    
    .severity-medium {
      background: #f59e0b;
      color: white;
    }
    
    .severity-low {
      background: #6b7280;
      color: white;
    }
    
    .issue-description {
      font-size: 14px;
      color: #374151;
      line-height: 1.7;
      margin-bottom: 12px;
    }
    
    .issue-pages {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }
    
    .issue-pages-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .issue-pages-list {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.8;
    }
    
    .issue-pages-list a {
      color: #3b82f6;
      text-decoration: none;
      word-break: break-all;
    }
    
    /* Empfehlungen */
    .recommendations-section {
      margin: 50px 0;
      page-break-inside: avoid;
    }
    
    .recommendations-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    .recommendations-list li {
      padding: 15px 0 15px 30px;
      position: relative;
      font-size: 15px;
      color: #374151;
      line-height: 1.8;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .recommendations-list li:last-child {
      border-bottom: none;
    }
    
    .recommendations-list li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #2EC4B6;
      font-weight: 700;
      font-size: 18px;
    }
    
    /* Fußzeile */
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
      page-break-inside: avoid;
    }
    
    .footer-brand {
      font-weight: 600;
      color: #0A2540;
      margin-bottom: 5px;
    }
    
    .footer-contact {
      color: #6b7280;
    }
      
    
    /* Leere Kategorien ausblenden */
    .empty-category {
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Titelseite / Kopfbereich -->
    <div class="title-page">
      <div class="title-header">
        <h1>SiteSweep</h1>
        <div class="subtitle">Website-Check – Analysebericht</div>
      </div>
      
      <div class="title-info">
        <div class="title-info-row">
          <span class="title-info-label">Analysierte URL:</span>
          <span class="title-info-value">${report.url}</span>
        </div>
        <div class="title-info-row">
          <span class="title-info-label">Datum:</span>
          <span class="title-info-value">${formattedDate}</span>
        </div>
      </div>
      
      <div class="title-score">
        <div class="title-score-value">${report.score}</div>
        <div class="title-score-label">von 100 Punkten</div>
        <div class="title-score-status">Status: ${scoreStatus.label}</div>
      </div>
      
      ${report.mobileScreenshotUrl
        ? `
      <div class="title-screenshot">
        <div class="title-screenshot-label">Mobile Vorschau</div>
        <img src="${report.mobileScreenshotUrl}" alt="Mobile Screenshot" class="title-screenshot-image" />
      </div>
      `
        : ''}
    </div>
    
    <!-- Abschnitt 1: Zusammenfassung -->
    <div class="summary-section">
      <h2 class="section-title">Zusammenfassung</h2>
      <p class="summary-text">
        Ihre Website wurde hinsichtlich technischer, SEO-, rechtlicher und UX-Aspekte geprüft.
        ${report.summary}
      </p>
      
      <div class="summary-stats">
        <div class="summary-stat">
          <div class="summary-stat-label">Gesamtprobleme</div>
          <div class="summary-stat-value">${totalIssues}</div>
        </div>
        <div class="summary-stat">
          <div class="summary-stat-label">Kritische Probleme</div>
          <div class="summary-stat-value critical">${criticalIssues}</div>
        </div>
        <div class="summary-stat">
          <div class="summary-stat-label">Mittlere Probleme</div>
          <div class="summary-stat-value medium">${mediumIssues}</div>
        </div>
        <div class="summary-stat">
          <div class="summary-stat-label">Kleine Probleme</div>
          <div class="summary-stat-value low">${lowIssues}</div>
        </div>
      </div>
    </div>
    
    <!-- Abschnitt 2: Detailanalyse nach Kategorien -->
    <div class="detail-section">
      <h2 class="section-title">Detailanalyse</h2>
      
      ${categories
        .map((category) => {
          const categoryIssues = groupedIssues[category] || []
          if (categoryIssues.length === 0) return ''

          return `
        <div class="category-section">
          <h3 class="category-title">${categoryLabels[category]} (${categoryIssues.length})</h3>
          ${categoryIssues
            .map((issue) => {
              const severityClass = `issue-${issue.severity}`
              const severityBadgeClass = `severity-${issue.severity}`
              const severityLabel =
                issue.severity === 'high' ? 'Kritisch' : issue.severity === 'medium' ? 'Mittel' : 'Gering'

              // Max. 5 URLs anzeigen
              const maxPages = 5
              const displayPages = issue.pages.slice(0, maxPages)
              const remainingPages = issue.pages.length - maxPages

              return `
            <div class="issue ${severityClass}">
              <div class="issue-header">
                <div class="issue-title">${issue.title}</div>
                <span class="severity-badge ${severityBadgeClass}">${severityLabel}</span>
              </div>
              <div class="issue-description">${issue.description}</div>
              ${issue.pages.length > 0
                ? `
              <div class="issue-pages">
                <div class="issue-pages-label">Betroffene Seiten (${issue.pages.length})</div>
                <div class="issue-pages-list">
                  ${displayPages.map((page) => `<div>• ${page}</div>`).join('')}
                  ${remainingPages > 0 ? `<div style="margin-top: 8px; font-style: italic;">und weitere ${remainingPages} Seite${remainingPages !== 1 ? 'n' : ''}</div>` : ''}
                </div>
              </div>
              `
                : ''}
            </div>
          `
            })
            .join('')}
        </div>
      `
        })
        .join('')}
    </div>
    
    <!-- Abschnitt 3: Empfehlungen -->
    <div class="recommendations-section">
      <h2 class="section-title">Empfehlungen</h2>
      <ul class="recommendations-list">
        ${recommendations.map((rec) => `<li>${rec}</li>`).join('')}
      </ul>
    </div>
    
    <!-- Fußzeile -->
    <div class="footer">
      <div class="footer-brand">Erstellt mit SiteSweep – Ihr Website-Check</div>
      <div class="footer-contact">www.sitesweep.de | info@sitesweep.de</div>
    </div>
  </div>
</body>
</html>
  `
}
