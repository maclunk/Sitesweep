'use client'

import { useState } from 'react'
import { industryTemplates } from '@/src/data/templates'
import { Copy, Check, FileText, Sparkles } from 'lucide-react'

export default function TemplatesPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(industryTemplates[0]?.id || '')
  const [copied, setCopied] = useState(false)
  const [editableContent, setEditableContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const selectedTemplate = industryTemplates.find(t => t.id === selectedTemplateId)

  const handleCopy = () => {
    const contentToCopy = isEditing ? editableContent : selectedTemplate?.content || ''
    navigator.clipboard.writeText(contentToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEdit = () => {
    if (!isEditing) {
      setEditableContent(selectedTemplate?.content || '')
    }
    setIsEditing(!isEditing)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Content-Vorlagen</h1>
        <p className="text-slate-400 mt-2">Professionelle Branchen-Templates für schnelle Website-Relaunches.</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Template Selection */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Branchen
              </h3>
            </div>
            <div className="p-2">
              <div className="space-y-1">
                {industryTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplateId(template.id)
                      setIsEditing(false)
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      selectedTemplateId === template.id
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="font-semibold">{template.name}</div>
                    <div className={`text-xs mt-1 ${selectedTemplateId === template.id ? 'text-blue-100' : 'text-slate-500'}`}>
                      {template.description.substring(0, 60)}...
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-4">
          {selectedTemplate && (
            <>
              {/* Template Info Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-2">{selectedTemplate.name}</h2>
                    <p className="text-sm text-slate-400">{selectedTemplate.description}</p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                      <FileText className="w-3.5 h-3.5" />
                      <span>
                        {selectedTemplate.content.split('\n').length} Zeilen • {selectedTemplate.content.split(' ').length} Wörter
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleEdit}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isEditing
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {isEditing ? '📝 Bearbeiten...' : 'Bearbeiten'}
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Kopiert!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Kopieren
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Preview/Editor */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                  <h3 className="font-semibold text-white">
                    {isEditing ? 'Bearbeitungsmodus' : 'Vorschau'}
                  </h3>
                </div>
                
                {isEditing ? (
                  /* Editable Textarea */
                  <div className="p-6">
                    <textarea
                      value={editableContent}
                      onChange={(e) => setEditableContent(e.target.value)}
                      className="w-full h-[600px] bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-300 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
                      placeholder="Template-Inhalt bearbeiten..."
                    />
                    <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
                      <span>💡 Tipp: Passen Sie Platzhalter wie [FIRMENNAME], [STADT] an, bevor Sie kopieren.</span>
                    </div>
                  </div>
                ) : (
                  /* Read-only Preview */
                  <div className="p-6 max-h-[600px] overflow-y-auto">
                    <div className="bg-slate-950 rounded-lg p-6">
                      <pre className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed font-sans">
                        {selectedTemplate.content}
                      </pre>
                    </div>
                    
                    {/* Platzhalter-Hinweis */}
                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <h4 className="text-sm font-semibold text-blue-400 mb-2">📋 Enthaltene Platzhalter:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(selectedTemplate.content.match(/\[([A-Z_]+)\]/g) || [])).map((placeholder, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs font-mono"
                          >
                            {placeholder}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-slate-400 mt-3">
                        Diese Platzhalter sollten durch echte Daten ersetzt werden (z.B. [FIRMENNAME] → "Meisterbetrieb Müller").
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Usage Instructions */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">💡 So verwenden Sie die Templates:</h3>
                <ol className="space-y-3 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span><strong>Template auswählen:</strong> Wählen Sie links die passende Branche (Handwerk, Arzt, Anwalt).</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span><strong>Optional bearbeiten:</strong> Klicken Sie auf "Bearbeiten", um Platzhalter anzupassen.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span><strong>Kopieren:</strong> Button "Kopieren" → Template ist in der Zwischenablage.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span><strong>Einfügen:</strong> Fügen Sie den Text in Ihr CMS ein (WordPress, Webflow, etc.).</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                    <span><strong>Anpassen:</strong> Ersetzen Sie alle [PLATZHALTER] durch die echten Kundendaten.</span>
                  </li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

