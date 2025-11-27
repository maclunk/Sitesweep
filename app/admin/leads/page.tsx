'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, ExternalLink } from 'lucide-react'

type LeadStatus = 'Neu' | 'Kontaktiert' | 'Gewonnen' | 'Verloren'

interface Lead {
  id: string
  domain: string
  status: LeadStatus
  notes: string
  createdAt: number
}

export default function LeadListPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [newDomain, setNewDomain] = useState('')
  const [loading, setLoading] = useState(true)

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('sitesweep_leads')
    if (saved) {
      try {
        setLeads(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse leads', e)
      }
    }
    setLoading(false)
  }, [])

  // Save to LocalStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('sitesweep_leads', JSON.stringify(leads))
    }
  }, [leads, loading])

  const addLead = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDomain.trim()) return

    const newLead: Lead = {
      id: crypto.randomUUID(),
      domain: newDomain.trim(),
      status: 'Neu',
      notes: '',
      createdAt: Date.now(),
    }

    setLeads([newLead, ...leads])
    setNewDomain('')
  }

  const removeLead = (id: string) => {
    setLeads(leads.filter(l => l.id !== id))
  }

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(leads.map(l => (l.id === id ? { ...l, ...updates } : l)))
  }

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'Neu': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'Kontaktiert': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      case 'Gewonnen': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'Verloren': return 'bg-slate-700 text-slate-400 border-slate-600'
      default: return 'bg-slate-800 text-slate-400'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Lead-Verwaltung</h1>
        <p className="text-slate-400 mt-2">Verfolgen Sie potenzielle Kunden und deren Status (Local Storage).</p>
      </div>

      {/* Add New Lead */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
        <form onSubmit={addLead} className="flex gap-4">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="Domain eingeben (z.B. kanzlei-mueller.de)"
            className="flex-1 px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={!newDomain.trim()}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Lead hinzufügen
          </button>
        </form>
      </div>

      {/* Lead Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950 text-slate-200 uppercase tracking-wider font-medium text-xs">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Domain</th>
                <th className="px-6 py-4">Notizen</th>
                <th className="px-6 py-4 text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Noch keine Leads vorhanden. Fügen Sie einen Lead oben hinzu.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateLead(lead.id, { status: e.target.value as LeadStatus })}
                        className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer outline-none ${getStatusColor(lead.status)}`}
                      >
                        <option value="Neu">Neu</option>
                        <option value="Kontaktiert">Kontaktiert</option>
                        <option value="Gewonnen">Gewonnen</option>
                        <option value="Verloren">Verloren</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">
                      <a href={`https://${lead.domain}`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 flex items-center gap-1 group">
                        {lead.domain}
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={lead.notes}
                        onChange={(e) => updateLead(lead.id, { notes: e.target.value })}
                        placeholder="Notizen hinzufügen..."
                        className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-blue-500 focus:outline-none w-full py-1 text-slate-300 placeholder-slate-600 transition-colors"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => removeLead(lead.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors p-1"
                        title="Lead löschen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
