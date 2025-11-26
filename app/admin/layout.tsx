import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans antialiased overflow-hidden">
      {/* Sidebar - Fixed Left */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 z-50">
        <AdminSidebar />
      </aside>

      {/* Main Content - Scrollable Right */}
      <main className="flex-1 md:ml-64 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
