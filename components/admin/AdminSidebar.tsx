'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Search, Wheat, Users, LogOut } from 'lucide-react'

// Helper function to combine class names
function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Deep Scan', href: '/admin/scan', icon: Search },
  { name: 'Content Harvest', href: '/admin/harvest', icon: Wheat },
  { name: 'Lead List', href: '/admin/leads', icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 border-r border-slate-800">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <span className="text-xl font-bold text-white tracking-tight">
          Site<span className="text-blue-500">Sweep</span>
          <span className="ml-2 text-xs font-mono text-slate-500">v2.0</span>
        </span>
      </div>
      
      <div className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
          Platform
        </div>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={() => {
            // Simple logout: clear potentially stored credentials (if any client-side) and force reload/redirect
            // Since we use Basic Auth, real "logout" is tricky without closing browser, but we can redirect.
            window.location.href = '/'
          }}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  )
}
