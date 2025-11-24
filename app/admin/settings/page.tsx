'use client'

import { useSearchParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default function AdminSettingsPage() {
  const searchParams = useSearchParams()
  const secret = searchParams.get('secret')

  if (!secret) {
    return (
      <>
        <AdminHeader title="Einstellungen" />
        <div className="p-6">
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-red-900 mb-4">Zugriff verweigert</h2>
            <p className="text-slate-600">
              Bitte verwenden Sie das korrekte Secret in der URL.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader
        title="Einstellungen"
        subtitle="Verwalten Sie die Admin-Konfiguration"
      />
      <div className="p-6 max-w-4xl">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">System-Informationen</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-sm text-slate-600">Version</span>
              <span className="text-sm font-medium text-slate-900">1.0.0</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-200">
              <span className="text-sm text-slate-600">Umgebung</span>
              <span className="text-sm font-medium text-slate-900">
                {process.env.NODE_ENV || 'production'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Hinweise</h2>
          <div className="space-y-2 text-sm text-slate-600">
            <p>
              Diese Seite ist noch in Entwicklung. Zukünftig können hier weitere Einstellungen verwaltet werden.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

