import type { Metadata } from 'next'
import '../globals.css'
import { AdminShell } from '@/components/admin/AdminShell'

export const metadata: Metadata = {
  title: 'SiteSweep Admin',
  description: 'Admin-Bereich für SiteSweep',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminShell>{children}</AdminShell>
}

