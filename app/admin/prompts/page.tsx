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
                <span>Stelle sicher, dass du die Harvester-Daten bereit hast (startseite.md, Bilder, kontakt_info.txt).</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">3.</span>
                <span>Kopiere den Prompt mit dem Button und füge ihn in Cursor AI ein.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">4.</span>
                <span><strong className="text-yellow-400">⚠️ Wichtig:</strong> Cursor wird NUR die vorhandenen Daten nutzen - keine Inhalte erfinden!</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">5.</span>
                <span>Cursor redesigned die Website mit den echten Kundendaten.</span>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-400 mb-1">Wichtiger Hinweis zu den Prompts</h4>
            <p className="text-sm text-slate-300">
              Alle Prompts sind so geschrieben, dass Cursor <strong>STRIKT</strong> nur die vorhandenen Harvester-Daten nutzt.
              Es werden <strong>keine neuen Texte erfunden</strong>, keine Features hinzugefügt und keine Platzhalter-Inhalte generiert.
              Das bedeutet: Was der Kunde nicht hat, kommt auch nicht auf die Website. Das ist gewollt und schützt vor falschen Versprechungen.
            </p>
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
                  📋 Benötigte Dateien (Cursor nutzt NUR diese):
                </h4>
                <ul className="space-y-1 text-xs text-slate-400">
                  {prompt.id === 'craft-relaunch' && (
                    <>
                      <li>✓ startseite.md (Harvester-Daten)</li>
                      <li>✓ kontakt_info.txt (Harvester-Daten)</li>
                      <li>✓ Bilder aus /images/ (Harvester-Daten)</li>
                      <li>✓ Template_Craft.tsx (Design-Basis)</li>
                    </>
                  )}
                  {prompt.id === 'trust-relaunch' && (
                    <>
                      <li>✓ startseite.md (Harvester-Daten)</li>
                      <li>✓ kontakt_info.txt (Harvester-Daten)</li>
                      <li>✓ Bilder aus /images/ (Harvester-Daten, falls vorhanden)</li>
                      <li>✓ Template_Trust.tsx (Design-Basis)</li>
                    </>
                  )}
                  {prompt.id === 'modern-relaunch' && (
                    <>
                      <li>✓ startseite.md (Harvester-Daten)</li>
                      <li>✓ kontakt_info.txt (Harvester-Daten)</li>
                      <li>✓ Bilder/Logo aus /images/ & /public/ (falls vorhanden)</li>
                      <li>✓ Template_Modern.tsx (Design-Basis)</li>
                    </>
                  )}
                </ul>
                <p className="mt-3 text-xs text-yellow-400 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>Wenn Dateien fehlen: Cursor lässt diese Bereiche weg. Keine Platzhalter!</span>
                </p>
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
              <li>✓ Harvester-ZIP entpacken (startseite.md, Bilder, kontakt_info.txt)</li>
              <li>✓ Template-Komponente bereitstellen</li>
              <li>✓ Projekt-Struktur prüfen (Next.js 14)</li>
              <li>✓ Prüfen: Sind ALLE Dateien da? (Cursor erfindet nichts nach!)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-300">Nach dem Prompting:</h4>
            <ul className="space-y-1 text-slate-400">
              <li>✓ Prüfen: Wurden NUR vorhandene Daten genutzt?</li>
              <li>✓ Build-Test (npm run build)</li>
              <li>✓ Mobile-Ansicht testen</li>
              <li>✓ Kontaktdaten verifizieren (richtige Links?)</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <h4 className="text-sm font-semibold text-red-400 mb-2">🚨 Was Cursor NICHT tun wird:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-400">
            <div>
              <p>❌ Neue Texte oder Headlines erfinden</p>
              <p>❌ Leistungen hinzufügen, die nicht im Harvester stehen</p>
              <p>❌ Fake-Testimonials oder Bewertungen</p>
            </div>
            <div>
              <p>❌ Platzhalter-Bilder einfügen (Unsplash, etc.)</p>
              <p>❌ Kontaktdaten erfinden (Öffnungszeiten, Preise)</p>
              <p>❌ Features "verbessern" oder umschreiben</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

