import IssueCard from './IssueCard'

interface CheckResult {
  id: string
  category: 'technical' | 'seo' | 'legal' | 'ux'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high'
  pages: string[]
}

interface ReportCardProps {
  score: number
  summary: string
  issues: CheckResult[]
}

const categoryLabels: Record<string, string> = {
  technical: 'Technisch',
  seo: 'SEO',
  legal: 'Rechtlich',
  ux: 'UX',
}

export default function ReportCard({ score, summary, issues }: ReportCardProps) {
  // Score-Farbe bestimmen (professionellere Farben)
  const getScoreColor = () => {
    if (score < 70) return '#dc2626' // rot - kritisch
    if (score < 85) return '#f59e0b' // orange - verbesserungswürdig
    if (score < 95) return '#3b82f6' // blau - gut
    return '#10b981' // grün - sehr gut
  }


  // Issues nach Kategorie gruppieren
  const groupedIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = []
    }
    acc[issue.category].push(issue)
    return acc
  }, {} as Record<string, CheckResult[]>)

  const categories = ['technical', 'seo', 'legal', 'ux'] as const

  return (
    <div className="report-card" style={{ padding: '2rem' }}>
      {/* Score-Anzeige */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '2rem',
          padding: '2rem',
          backgroundColor: '#f9fafb',
          borderRadius: '12px',
        }}
      >
        <div
          style={{
            fontSize: '4rem',
            fontWeight: 'bold',
            color: getScoreColor(),
            marginBottom: '0.5rem',
          }}
        >
          {score}
        </div>
        <div style={{ fontSize: '1.5rem', color: '#6b7280', fontWeight: '600' }}>/ 100</div>
      </div>

      {/* Summary */}
      <div
        style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '8px',
        }}
      >
        <p style={{ fontSize: '1.125rem', color: '#374151', lineHeight: '1.6' }}>{summary}</p>
      </div>

      {/* Issues gruppiert nach Kategorie */}
      <div>
        {categories.map((category) => {
          const categoryIssues = groupedIssues[category] || []
          if (categoryIssues.length === 0) return null

          return (
            <div key={category} style={{ marginBottom: '2rem' }}>
              <h3
                style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#1f2937',
                  borderBottom: '2px solid #e5e7eb',
                  paddingBottom: '0.5rem',
                }}
              >
                {categoryLabels[category]} ({categoryIssues.length})
              </h3>
              <div>
                {categoryIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    title={issue.title}
                    description={issue.description}
                    severity={issue.severity}
                    pages={issue.pages}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

