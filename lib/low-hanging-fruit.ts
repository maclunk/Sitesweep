/**
 * Low Hanging Fruit Selection - Picks the best issue to highlight at the top of the report
 * 
 * Priority order:
 * 1) missing_impressum / impressum_invalid (legal & trust)
 * 2) missing_datenschutz / cookie_no_consent
 * 3) copyright_year_outdated
 * 4) broken_links_high
 * 5) homepage_cta_missing
 * 6) mobile_usability_bad
 * Else: highest severity + lowest fixEffort
 */

import { CheckResult } from './checks'
import { getIssueExplanation } from './issue-explanations'

export interface LowHangingFruitResult {
  issue: CheckResult
  rule: string // Which rule picked this issue (for admin debugging)
}

/**
 * Priority order of issue IDs for low hanging fruit selection
 */
const PRIORITY_ISSUE_IDS = [
  'legal-missing-impressum',
  'no-impressum',
  'legal-missing-privacy',
  'no-datenschutz',
  'legal-missing-cookie-banner',
  'no-cookie-banner',
  'copyright_year_outdated', // Note: This check might need to be added
  'technical-broken-links',
  'technical-404-pages',
  '404-pages',
  'ux_missing_primary_cta',
  'no-cta-button',
  'ux_mobile_overflow',
  'ux_missing_viewport',
  'missing-responsive-meta',
  'technical-missing-responsive-meta',
]

/**
 * Selects the best "low hanging fruit" issue from the list
 */
export function selectLowHangingFruit(issues: CheckResult[]): LowHangingFruitResult | null {
  if (!issues || issues.length === 0) {
    return null
  }

  // 1. Check priority order first
  for (const priorityId of PRIORITY_ISSUE_IDS) {
    const matchingIssue = issues.find((issue) => issue.id === priorityId)
    if (matchingIssue) {
      return {
        issue: matchingIssue,
        rule: `priority_order_${priorityId}`,
      }
    }
  }

  // 2. Fallback: Find highest severity + lowest fixEffort
  // Filter for issues with business explanations (we need fixEffort)
  const issuesWithExplanation = issues
    .map((issue) => {
      const explanation = issue.id ? getIssueExplanation(issue.id) : null
      return {
        issue,
        explanation,
      }
    })
    .filter((item) => item.explanation !== null)

  if (issuesWithExplanation.length === 0) {
    // If no explanations available, pick first high severity issue
    const highSeverity = issues.find((issue) => issue.severity === 'high')
    if (highSeverity) {
      return {
        issue: highSeverity,
        rule: 'fallback_high_severity',
      }
    }
    // Else pick first issue
    if (issues.length > 0) {
      return {
        issue: issues[0],
        rule: 'fallback_first_issue',
      }
    }
    return null
  }

  // Sort by: severity (high > medium > low), then fixEffort (easy < medium < hard)
  const severityOrder = { high: 3, medium: 2, low: 1 }
  const fixEffortOrder = { easy: 1, medium: 2, hard: 3 }

  issuesWithExplanation.sort((a, b) => {
    const aSeverity = severityOrder[a.issue.severity as keyof typeof severityOrder] || 0
    const bSeverity = severityOrder[b.issue.severity as keyof typeof severityOrder] || 0

    // First sort by severity (descending)
    if (aSeverity !== bSeverity) {
      return bSeverity - aSeverity
    }

    // Then by fixEffort (ascending - easy is better)
    const aEffort = a.explanation
      ? fixEffortOrder[a.explanation.fixEffort]
      : 999
    const bEffort = b.explanation
      ? fixEffortOrder[b.explanation.fixEffort]
      : 999

    return aEffort - bEffort
  })

  const bestMatch = issuesWithExplanation[0]
  return {
    issue: bestMatch.issue,
    rule: `highest_severity_lowest_fixeffort_${bestMatch.issue.severity}_${bestMatch.explanation?.fixEffort}`,
  }
}

