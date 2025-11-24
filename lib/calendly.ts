/**
 * Calendly Integration - Helper Functions
 * 
 * Generates Calendly booking links with dynamic URL prefill
 */

const CALENDLY_BASE_URL = 'https://calendly.com/sitesweep-info/analyse'

/**
 * Generates a Calendly booking link with optional URL prefill
 * 
 * @param scannedUrl - The scanned website URL to prefill in Calendly (optional)
 * @returns The full Calendly booking link with prefill parameter
 */
export function getCalendlyLink(scannedUrl?: string | null): string {
  if (!scannedUrl) {
    // If no URL provided, return base link without prefill
    return CALENDLY_BASE_URL
  }
  
  // Encode the scanned URL as a1 parameter (Answer 1)
  const prefillParam = `?a1=${encodeURIComponent(scannedUrl)}`
  return `${CALENDLY_BASE_URL}${prefillParam}`
}

/**
 * Opens Calendly booking page in a new window/tab
 * 
 * @param scannedUrl - The scanned website URL to prefill in Calendly (optional)
 */
export function openCalendly(scannedUrl?: string | null): void {
  const link = getCalendlyLink(scannedUrl)
  window.open(link, '_blank', 'noopener,noreferrer')
}

