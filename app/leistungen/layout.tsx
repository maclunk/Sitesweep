import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preise & Leistungen: Website Relaunch zum Festpreis',
  description: 'Transparente Kosten für Website-Reparatur und Relaunch. Keine versteckten Gebühren. Ab 199€ für Sicherheits-Updates oder 990€ für eine neue Website.',
}

export default function LeistungenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

