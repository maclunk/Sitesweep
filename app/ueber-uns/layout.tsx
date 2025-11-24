import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Über uns: Das Team hinter SiteSweep',
}

export default function UeberUnsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

