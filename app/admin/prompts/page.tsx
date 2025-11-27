'use client'

import { useState } from 'react'
import { systemPrompts } from '@/src/data/cursorPrompts'
import { Copy, Check, Terminal, Sparkles } from 'lucide-react'

export default function PromptsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (promptText: string, id: string) => {
    navigator.clipboard.writeText(promptText)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Terminal className="w-8 h-8 text-blue-500" />
          Cursor AI Prompts
        </h1>
        <p className="text-slate-400 mt-2">
          System-Prompts für Website-Relaunches mit Cursor AI. Kopieren und direkt in Cursor einfügen.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <Sparkles className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Wie funktioniert's?</h3>
            <ol className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">1.</span>
                <span>Wähle den passenden Prompt für die Branche deines Kunden (Handwerk, Arzt/Anwalt, Modern).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">2.</span>
                <span>Kopiere den Prompt mit dem Button unten rechts.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">3.</span>
                <span>Öffne Cursor AI und füge den Prompt im Chat ein.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">4.</span>
                <span>Stelle sicher, dass du die Input-Dateien bereit hast (startseite.md, Bilder, etc.).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">5.</span>
                <span>Cursor baut die Website automatisch nach deinen Vorgaben!</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="grid grid-cols-1 gap-6">
        {systemPrompts.map((prompt) => (
          <div
            key={prompt.id}
            className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors"
          >
            {/* Card Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">{prompt.title}</h2>
                  <p className="text-sm text-slate-400">{prompt.description}</p>
                </div>
                <button
                  onClick={() => handleCopy(prompt.promptText, prompt.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    copiedId === prompt.id
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {copiedId === prompt.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      Kopiert!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Prompt kopieren
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Prompt Code Block */}
            <div className="p-6">
              <div className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>system_prompt.txt</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    {prompt.promptText.split('\n').length} Zeilen
                  </div>
                </div>
                <div className="p-4 max-h-[300px] overflow-y-auto">
                  <pre className="text-sm text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {prompt.promptText}
                  </pre>
                </div>
              </div>
            </div>

            {/* Usage Tips */}
            <div className="px-6 pb-6">
              <div className="bg-slate-950 border border-slate-700 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  💡 Voraussetzungen für diesen Prompt:
                </h4>
                <ul className="space-y-1 text-xs text-slate-400">
                  {prompt.id === 'craft-relaunch' && (
                    <>
                      <li>✓ Template_Craft.tsx Komponente bereit</li>
                      <li>✓ startseite.md aus Harvester-ZIP</li>
                      <li>✓ Bilder in /images/ Ordner</li>
                      <li>✓ Next.js 14 Projekt initialisiert</li>
                    </>
                  )}
                  {prompt.id === 'trust-relaunch' && (
                    <>
                      <li>✓ Template_Trust.tsx Komponente bereit</li>
                      <li>✓ startseite.md + kontakt.txt</li>
                      <li>✓ Optional: Team-Fotos in /images/team/</li>
                      <li>✓ Kontaktdaten (Telefon, E-Mail) verfügbar</li>
                    </>
                  )}
                  {prompt.id === 'modern-relaunch' && (
                    <>
                      <li>✓ Template_Modern.tsx Komponente bereit</li>
                      <li>✓ startseite.md mit UVP</li>
                      <li>✓ Optional: brand-colors.json, logo.svg</li>
                      <li>✓ lucide-react & framer-motion installiert</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Best Practices Footer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">🎯 Best Practices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-300">Vor dem Prompting:</h4>
            <ul className="space-y-1 text-slate-400">
              <li>• Harvester-Daten vorbereiten (ZIP entpacken)</li>
              <li>• Template-Komponente in /components/ platzieren</li>
              <li>• Projekt-Struktur prüfen (Next.js 14 App Router)</li>
              <li>• Dependencies installieren (npm install)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-300">Nach dem Prompting:</h4>
            <ul className="space-y-1 text-slate-400">
              <li>• Code-Qualität prüfen (npm run build)</li>
              <li>• SEO-Meta-Tags kontrollieren</li>
              <li>• Mobile-Ansicht testen (Responsive)</li>
              <li>• Performance optimieren (Bilder, Fonts)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

