import { db } from './db'

/**
 * Updates the benchmark aggregate for a given industry + city combination.
 * Only calculates if we have enough data (min 10 samples).
 * Uses the last N scans (capped at 50) to calculate average.
 */
export async function updateBenchmarkAggregate(
  industry: string,
  city: string,
  currentScore: number
): Promise<void> {
  if (!industry || !city) {
    // Skip if industry or city is missing
    return
  }

  try {
    // Find recent completed scans with the same industry + city
    // Limit to last 50 scans, but need at least 10 for valid benchmark
    const recentScans = await db.scanJob.findMany({
      where: {
        status: 'done',
        industry: industry.trim(),
        city: city.trim(),
        result: {
          isNot: null,
        },
      },
      include: {
        result: true,
      },
      orderBy: {
        finishedAt: 'desc',
      },
      take: 50, // Cap at 50 most recent scans
    })

    // Filter to only scans with valid results
    const validScans = recentScans.filter(
      (scan) => scan.result && typeof scan.result.score === 'number'
    )

    const sampleSize = validScans.length

    // Always create/update aggregate, even if sampleSize < 10
    // (for admin visibility, but won't show in public view)
    if (sampleSize === 0) {
      // If no valid scans, delete the aggregate
      await db.benchmarkAggregate.deleteMany({
        where: {
          industry: industry.trim(),
          city: city.trim(),
        },
      })
      return
    }

    // Calculate average score
    const totalScore = validScans.reduce(
      (sum, scan) => sum + (scan.result?.score || 0),
      0
    )
    const avgScore = totalScore / sampleSize

    // Upsert the aggregate
    await db.benchmarkAggregate.upsert({
      where: {
        industry_city: {
          industry: industry.trim(),
          city: city.trim(),
        },
      },
      create: {
        industry: industry.trim(),
        city: city.trim(),
        avgScore,
        sampleSize,
      },
      update: {
        avgScore,
        sampleSize,
        updatedAt: new Date(),
      },
    })
  } catch (error) {
    // Log error but don't fail the scan
    console.error(
      `Error updating benchmark aggregate for ${industry} in ${city}:`,
      error
    )
  }
}

/**
 * Gets benchmark data for a given industry + city combination.
 * Returns null if no data exists or sample size is too low.
 * @param isAdmin If true, returns data even if sampleSize < 10
 */
export async function getBenchmark(
  industry: string | null | undefined,
  city: string | null | undefined,
  isAdmin: boolean = false
): Promise<{ avgScore: number; sampleSize: number } | null> {
  if (!industry || !city) {
    return null
  }

  try {
    const aggregate = await db.benchmarkAggregate.findUnique({
      where: {
        industry_city: {
          industry: industry.trim(),
          city: city.trim(),
        },
      },
    })

    if (!aggregate) {
      return null
    }

    // For public views, require min 10 samples
    // For admin views, show even with fewer samples
    if (!isAdmin && aggregate.sampleSize < 10) {
      return null
    }

    return {
      avgScore: aggregate.avgScore,
      sampleSize: aggregate.sampleSize,
    }
  } catch (error) {
    console.error(`Error getting benchmark for ${industry} in ${city}:`, error)
    return null
  }
}

