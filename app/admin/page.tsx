'use client'

import Link from 'next/link'
import { Activity, Search, Wheat, ArrowRight } from 'lucide-react'

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 mt-2">Willkommen zurück, Marcus. System ist betriebsbereit.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Gesamte Scans</p>
              <h3 className="text-2xl font-bold text-white">0</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Wheat className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Aktive Leads</p>
              <h3 className="text-2xl font-bold text-white">0</h3>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">System-Status</p>
              <h3 className="text-2xl font-bold text-white">Online</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Schnellzugriff</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/admin/scan"
            className="group relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-6 rounded-xl transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                  <Search className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Neuer Scan</h3>
                  <p className="text-sm text-slate-500">Einzelne URL tiefgehend analysieren</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 transform group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link 
            href="/admin/harvest"
            className="group relative overflow-hidden bg-slate-900 border border-slate-800 hover:border-green-500/50 p-6 rounded-xl transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <Wheat className="w-6 h-6 text-slate-400 group-hover:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Content importieren</h3>
                  <p className="text-sm text-slate-500">Text & Bilder extrahieren</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-green-400 transform group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
