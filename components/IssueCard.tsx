'use client'

import { useState } from 'react'
import { getIssueExplanation } from '@/lib/issue-explanations'

interface IssueCardProps {
  id?: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  pages: string[]
}

export default function IssueCard({ id, title, description, severity, pages }: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTechnical, setShowTechnical] = useState(false)
  
  // Get business-friendly explanation if available
  const businessExplanation = id ? getIssueExplanation(id) : null
  
  // Log missing explanations for admin tracking (only in development/console)
  if (id && !businessExplanation && typeof window !== 'undefined') {
    console.warn(`[IssueCard] No business explanation found for issue ID: ${id}. TODO: Add to issue-explanations.ts`)
  }
  
  // Use business explanation if available, otherwise fall back to technical
  const displayTitle = businessExplanation?.titleBusiness || title
  const displayDescription = businessExplanation?.explanationBusiness || description

  // Severity-Farben
  const getSeverityColors = () => {
    switch (severity) {
      case 'high':
        return {
          border: '#ef4444',
          background: '#fee2e2',
          text: '#991b1b',
          badge: '#dc2626',
        }
      case 'medium':
        return {
          border: '#f59e0b',
          background: '#fef3c7',
          text: '#92400e',
          badge: '#d97706',
        }
      case 'low':
        return {
          border: '#9ca3af',
          background: '#f3f4f6',
          text: '#374151',
          badge: '#6b7280',
        }
    }
  }

  const colors = getSeverityColors()
  const severityLabels: Record<string, string> = {
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig',
  }

  return (
    <div
      className="issue-card"
      style={{
        borderLeft: `4px solid ${colors.border}`,
        backgroundColor: colors.background,
        padding: '1.25rem',
        margin: '0.75rem 0',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <span
          className="severity"
          style={{
            display: 'inline-block',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            backgroundColor: colors.badge,
            color: 'white',
            flexShrink: 0,
          }}
        >
          {severityLabels[severity]}
        </span>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '1.0625rem', fontWeight: '600', marginBottom: '0.5rem', color: colors.text, lineHeight: '1.4' }}>
            {displayTitle}
          </h4>
          <p style={{ fontSize: '0.9375rem', color: colors.text, marginBottom: '0.75rem', lineHeight: '1.5' }}>
            {displayDescription}
          </p>
          
          {/* Impact and Fix Effort Badges */}
          {businessExplanation && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: '#e0e7ff',
                  color: '#4338ca',
                }}
              >
                Auswirkung: {businessExplanation.impactLabel}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  backgroundColor: businessExplanation.fixEffort === 'easy' 
                    ? '#dcfce7' 
                    : businessExplanation.fixEffort === 'medium'
                    ? '#fef3c7'
                    : '#fee2e2',
                  color: businessExplanation.fixEffort === 'easy'
                    ? '#166534'
                    : businessExplanation.fixEffort === 'medium'
                    ? '#92400e'
                    : '#991b1b',
                }}
              >
                Fix-Aufwand: {businessExplanation.fixEffort === 'easy' ? 'Einfach' : businessExplanation.fixEffort === 'medium' ? 'Mittel' : 'Schwer'}
              </span>
            </div>
          )}
          
          {/* Technical Details Toggle (only show if business explanation exists) */}
          {businessExplanation && (
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'transparent',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: '#64748b',
                fontWeight: '500',
                marginBottom: '0.75rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc'
                e.currentTarget.style.borderColor = '#94a3b8'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = '#cbd5e1'
              }}
            >
              <span>Technisches Detail</span>
              <span style={{ fontSize: '0.75rem' }}>{showTechnical ? '▲' : '▼'}</span>
            </button>
          )}
          
          {showTechnical && businessExplanation && (
            <div
              style={{
                padding: '0.75rem',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                marginBottom: '0.75rem',
                fontSize: '0.875rem',
                color: '#475569',
              }}
            >
              <p style={{ fontWeight: '600', marginBottom: '0.25rem', color: '#334155' }}>Technisch:</p>
              <p style={{ marginBottom: '0.25rem' }}><strong>{title}</strong></p>
              <p>{description}</p>
            </div>
          )}
          {pages.length > 0 && (
            <div>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 0.875rem',
                  backgroundColor: 'transparent',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: colors.text,
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                <span>
                  {pages.length} betroffene Seite{pages.length !== 1 ? 'n' : ''}
                </span>
                <span style={{ fontSize: '0.75rem' }}>{isExpanded ? '▲' : '▼'}</span>
              </button>
              {isExpanded && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {pages.map((page, index) => (
                      <li
                        key={index}
                        style={{
                          padding: '0.5rem',
                          borderBottom: index < pages.length - 1 ? `1px solid #e5e7eb` : 'none',
                        }}
                      >
                        <a
                          href={page}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#3b82f6',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            wordBreak: 'break-all',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.textDecoration = 'underline'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.textDecoration = 'none'
                          }}
                        >
                          {page}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

