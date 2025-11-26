import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Über uns: Das Gründer-Team aus Aachen',
  description: 'Wir sind Marcus & Luis, Mathematik-Studenten aus Aachen. Wir bieten ehrliche Web-Analyse, logische Struktur und sauberen Code für den Mittelstand.',
}

export default function UeberUnsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

