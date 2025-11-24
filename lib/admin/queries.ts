import { db } from '../db'

// Helper functions for date calculations (to avoid dependency on date-fns)
function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfWeek(date: Date, options?: { weekStartsOn?: number }): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day < (options?.weekStartsOn || 1) ? 7 : 0) + day - (options?.weekStartsOn || 1)
  d.setDate(d.getDate() - diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function subDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return d
}

/**
 * Admin Dashboard Queries
 * Performance-optimiert mit Limits und effizienten Aggregations
 */

interface DashboardKPIs {
  scansToday: number
  scansThisWeek: number
  openLeads: number
  avgScoreLast7Days: number
}

interface QueueStatus {
  pending: number
  running: number
  failed: number
}

interface RecentScan {
  id: string
  url: string
  label: string | null
  status: string
  createdAt: Date
  score: number | null
  finishedAt: Date | null
}

/**
 * Berechnet alle Dashboard-KPIs in einem Query-Batch
 */
export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  const today = startOfDay(new Date())
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
  const sevenDaysAgo = subDays(new Date(), 7)

  // Parallel alle Queries ausführen für Performance
  const [scansToday, scansThisWeek, openLeadsResult, avgScoreData] = await Promise.all([
    // Scans heute
    db.scanJob.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    }),
    // Scans diese Woche
    db.scanJob.count({
      where: {
        createdAt: {
          gte: weekStart,
        },
      },
    }),
    // Offene Leads (Leads mit Status NEW oder CONTACTED)
    // Performance: Use simple count query instead of loading all leads
    (async () => {
      try {
        const openLeadsCount = await (db as any).lead.count({
          where: {
            status: {
              in: ['NEW', 'CONTACTED'],
            },
          },
        }).catch(() => 0)
        return openLeadsCount
      } catch {
        // Falls Lead-Tabelle nicht existiert oder leer ist
        return 0
      }
    })(),
    // Durchschnittlicher Score der letzten 7 Tage
    db.scanResult.aggregate({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _avg: {
        score: true,
      },
    }),
  ])

  const openLeads = typeof openLeadsResult === 'number' ? openLeadsResult : 0

  return {
    scansToday,
    scansThisWeek,
    openLeads,
    avgScoreLast7Days: avgScoreData._avg.score ? Math.round(avgScoreData._avg.score) : 0,
  }
}

/**
 * Gibt den Queue-Status zurück (pending, running, failed)
 */
export async function getQueueStatus(): Promise<QueueStatus> {
  const [pending, running, failed] = await Promise.all([
    db.scanJob.count({
      where: { status: 'pending' },
    }),
    db.scanJob.count({
      where: { status: 'running' },
    }),
    db.scanJob.count({
      where: { status: 'error' },
    }),
  ])

  return {
    pending,
    running,
    failed,
  }
}

/**
 * Gibt die neuesten Scans zurück (limit 20)
 * Performance: Nur benötigte Felder laden, mit Join zu ScanResult für Score
 */
export async function getRecentScans(limit: number = 20): Promise<RecentScan[]> {
  const jobs = await db.scanJob.findMany({
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      result: {
        select: {
          score: true,
        },
      },
    },
  })

  return jobs.map((job: any) => ({
    id: job.id,
    url: job.url,
    label: job.label || null,
    status: job.status,
    createdAt: job.createdAt,
    score: job.result?.score ?? null,
    finishedAt: job.finishedAt,
  }))
}
