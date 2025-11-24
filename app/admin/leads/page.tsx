'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { TableSkeleton } from '@/components/admin/LoadingSkeleton'
import Link from 'next/link'
import {
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Tag as TagIcon,
  Calendar,
  X,
  Edit2,
  FileDown,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  MessageSquare,
} from 'lucide-react'

interface Lead {
  id: string
  name: string
  website: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  category: string | null
  status: string
  notes: string | null
  worstScore: number | null
  latestScanDate: string | null
  latestScanJobId: string | null
  createdAt: string
  lastActivityAt: string | null
}

type LeadStatus = 'NEW' | 'CONTACTED' | 'BOOKED' | 'CLOSED'

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; icon: any }> = {
  NEW: { label: 'Neu', color: 'bg-blue-100 text-blue-700', icon: Clock },
  CONTACTED: { label: 'Kontaktiert', color: 'bg-yellow-100 text-yellow-700', icon: MessageSquare },
  BOOKED: { label: 'Gebucht', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  CLOSED: { label: 'Abgeschlossen', color: 'bg-slate-100 text-slate-700', icon: XCircle },
}

export default function AdminLeadsPage() {
  const searchParams = useSearchParams()
  const secret = searchParams.get('secret')

  const [leads, setLeads] = useState<Lead[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [minScore, setMinScore] = useState<string>('')
  const [maxScore, setMaxScore] = useState<string>('')
  
  // Detail Drawer
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Debounced search effect (500ms delay for search input)
  useEffect(() => {
    if (!secret) return
    const timer = setTimeout(() => {
      loadLeads()
    }, search ? 500 : 0) // No delay if search is empty
    return () => clearTimeout(timer)
  }, [secret, search])

  // Immediate load for non-search filters
  useEffect(() => {
    if (!secret) return
    // Cancel any pending search debounce
    loadLeads()
  }, [secret, statusFilter, categoryFilter, minScore, maxScore])

  const loadLeads = useCallback(async () => {
    if (!secret) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ secret })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (categoryFilter) params.set('category', categoryFilter)
      if (minScore) params.set('minScore', minScore)
      if (maxScore) params.set('maxScore', maxScore)

      const response = await fetch(`/api/admin/leads?${params.toString()}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Zugriff verweigert')
          setLoading(false)
          return
        }
        throw new Error('Fehler beim Laden der Leads')
      }

      const data = await response.json()
      const result = data.success && data.data ? data.data : data
      
      setLeads(result.leads || [])
      setCategories(result.categories || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Laden der Leads')
    } finally {
      setLoading(false)
    }
  }, [secret, search, statusFilter, categoryFilter, minScore, maxScore])

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    if (!secret) return

    try {
      const response = await fetch(
        `/api/admin/leads/${leadId}/status?secret=${encodeURIComponent(secret)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      )

      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren des Status')
      }

      // Reload leads
      await loadLeads()
      
      // Update selected lead if open
      if (selectedLead && selectedLead.id === leadId) {
        const updated = await fetch(
          `/api/admin/leads/${leadId}/status?secret=${encodeURIComponent(secret)}`
        ).then((r) => r.json())
        // Note: We would need a GET endpoint for single lead, but for now just reload
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Aktualisieren des Status')
    }
  }

  const saveNotes = async () => {
    if (!secret || !selectedLead) return

    setSaving(true)
    try {
      const response = await fetch(
        `/api/admin/leads/${selectedLead.id}/notes?secret=${encodeURIComponent(secret)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes }),
        }
      )

      if (!response.ok) {
        throw new Error('Fehler beim Speichern der Notizen')
      }

      await loadLeads()
      alert('Notizen gespeichert')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Fehler beim Speichern der Notizen')
    } finally {
      setSaving(false)
    }
  }

  const openLeadDetail = (lead: Lead) => {
    setSelectedLead(lead)
    setNotes(lead.notes || '')
    setDrawerOpen(true)
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-slate-400'
    if (score < 50) return 'text-red-600 font-bold'
    if (score < 70) return 'text-yellow-600 font-semibold'
    return 'text-green-600'
  }

  const exportLead = (lead: Lead) => {
    const data = {
      Name: lead.name,
      Website: lead.website || '',
      Stadt: lead.city || '',
      Branche: lead.category || '',
      Score: lead.worstScore || '',
      Status: STATUS_CONFIG[lead.status as LeadStatus]?.label || lead.status,
      Email: lead.email || '',
      Telefon: lead.phone || '',
      Adresse: lead.address || '',
      'Letzte Aktivität': lead.lastActivityAt ? new Date(lead.lastActivityAt).toLocaleString('de-DE') : '',
      'Erstellt am': new Date(lead.createdAt).toLocaleString('de-DE'),
      Notizen: lead.notes || '',
    }

    const csv = Object.keys(data).join(',') + '\n' + Object.values(data).join(',')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `lead-${lead.name.replace(/[^a-z0-9]/gi, '_')}-${Date.now()}.csv`
    link.click()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '–'
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (!secret) {
    return (
      <>
        <AdminHeader title="Leads" />
        <div className="p-6">
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-red-900 mb-4">Zugriff verweigert</h2>
            <p className="text-slate-600">Bitte verwenden Sie das korrekte Secret in der URL.</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <AdminHeader
        title="Leads"
        subtitle="Mini-CRM für Lead-Verwaltung"
        actions={
          <button
            onClick={() => loadLeads()}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Aktualisieren
          </button>
        }
      />
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-900">Filter</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Suche..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Alle Status</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Alle Branchen</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Score Range */}
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min Score"
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  min="0"
                  max="100"
                />
                <input
                  type="number"
                  placeholder="Max Score"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <TableSkeleton rows={10} />
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl shadow-sm p-6">
              <p className="text-red-800 font-semibold">Fehler</p>
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Firmenname</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Website</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Stadt/Branche</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">Letzte Aktivität</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wide">Aktionen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                          Keine Leads gefunden
                        </td>
                      </tr>
                    ) : (
                      leads.map((lead) => {
                        const StatusIcon = STATUS_CONFIG[lead.status as LeadStatus]?.icon || Clock
                        return (
                          <tr key={lead.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900">{lead.name}</div>
                              {lead.email && (
                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                  <Mail className="w-3 h-3" />
                                  {lead.email}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {lead.website ? (
                                <a
                                  href={lead.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sky-600 hover:text-sky-700 text-sm flex items-center gap-1"
                                >
                                  {lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              ) : (
                                <span className="text-slate-400 text-sm">–</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-slate-700">
                                {lead.city && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-slate-400" />
                                    {lead.city}
                                  </div>
                                )}
                                {lead.category && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <TagIcon className="w-3 h-3 text-slate-400" />
                                    {lead.category}
                                  </div>
                                )}
                                {!lead.city && !lead.category && <span className="text-slate-400">–</span>}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-sm font-semibold ${getScoreColor(lead.worstScore)}`}>
                                {lead.worstScore !== null ? lead.worstScore : '–'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_CONFIG[lead.status as LeadStatus]?.color || 'bg-slate-100 text-slate-700'}`}>
                                <StatusIcon className="w-3 h-3" />
                                {STATUS_CONFIG[lead.status as LeadStatus]?.label || lead.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {formatDate(lead.lastActivityAt)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openLeadDetail(lead)}
                                  className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                  title="Details anzeigen"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <div className="relative group">
                                  <button
                                    className="p-2 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                    title="Status ändern"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[160px]">
                                    {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                      <button
                                        key={key}
                                        onClick={() => updateLeadStatus(lead.id, key as LeadStatus)}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2"
                                      >
                                        <config.icon className="w-4 h-4" />
                                        {config.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <button
                                  onClick={() => exportLead(lead)}
                                  className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Exportieren"
                                >
                                  <FileDown className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {drawerOpen && selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setDrawerOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-slate-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">Lead-Details</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Firmendaten */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Firmendaten</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Firmenname</p>
                    <p className="text-slate-900 font-medium">{selectedLead.name}</p>
                  </div>
                  {selectedLead.website && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Website</p>
                      <a
                        href={selectedLead.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-600 hover:text-sky-700 flex items-center gap-2"
                      >
                        {selectedLead.website}
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                  {selectedLead.city && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Stadt</p>
                      <p className="text-slate-700">{selectedLead.city}</p>
                    </div>
                  )}
                  {selectedLead.category && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Branche</p>
                      <p className="text-slate-700">{selectedLead.category}</p>
                    </div>
                  )}
                  {selectedLead.email && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">E-Mail</p>
                      <a href={`mailto:${selectedLead.email}`} className="text-sky-600 hover:text-sky-700">
                        {selectedLead.email}
                      </a>
                    </div>
                  )}
                  {selectedLead.phone && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Telefon</p>
                      <a href={`tel:${selectedLead.phone}`} className="text-sky-600 hover:text-sky-700">
                        {selectedLead.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Letzter Scan */}
              {selectedLead.latestScanJobId && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Letzter Scan</h3>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Score:</span>
                      <span className={`font-bold ${getScoreColor(selectedLead.worstScore)}`}>
                        {selectedLead.worstScore !== null ? selectedLead.worstScore : '–'}
                      </span>
                    </div>
                    {selectedLead.latestScanDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Datum:</span>
                        <span className="text-sm text-slate-700">
                          {new Date(selectedLead.latestScanDate).toLocaleString('de-DE')}
                        </span>
                      </div>
                    )}
                    <Link
                      href={`/admin/jobs/${selectedLead.latestScanJobId}?secret=${encodeURIComponent(secret || '')}`}
                      className="block mt-3 px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-lg hover:bg-sky-700 transition-colors text-center"
                    >
                      Zur Scan-Detailseite
                    </Link>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Notizen</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Interne Notizen zu diesem Lead..."
                />
                <button
                  onClick={saveNotes}
                  disabled={saving}
                  className="mt-3 px-4 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors disabled:bg-sky-400 disabled:cursor-not-allowed"
                >
                  {saving ? 'Wird gespeichert...' : 'Notizen speichern'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
