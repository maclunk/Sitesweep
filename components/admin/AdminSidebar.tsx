'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Search,
  Users,
  FileText,
  Settings,
  Activity,
  ChevronLeft,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Scans', href: '/admin/scans', icon: Search },
  { label: 'Leads', href: '/admin/leads', icon: Users },
  { label: 'Mass Scan', href: '/admin/mass-scan', icon: FileText },
  { label: 'Jobs', href: '/admin/jobs', icon: Activity },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const secret = searchParams.get('secret')
  const [collapsed, setCollapsed] = useState(false)

  const getHrefWithSecret = (href: string) => {
    if (secret) {
      return `${href}?secret=${encodeURIComponent(secret)}`
    }
    return href
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } bg-slate-900 text-white border-r border-slate-800 transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-40`}
    >
      {/* Sidebar Header */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">SiteSweep</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center mx-auto">
            <Search className="w-5 h-5 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-slate-800 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft
            className={`w-5 h-5 transition-transform ${collapsed ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={getHrefWithSecret(item.href)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                ${
                  active
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="h-12 border-t border-slate-800 px-4 flex items-center">
        {!collapsed && (
          <p className="text-xs text-slate-400">Admin Panel v1.0</p>
        )}
      </div>
    </aside>
  )
}

