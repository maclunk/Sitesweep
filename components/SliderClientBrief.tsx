/**
 * SliderClientBrief - Komponente für Kundenwunsch-Erklärung unter BeforeAfterSlider
 * 
 * Zeigt Besuchern, dass die "Nachher"-Seite nach konkreten Kundenwünschen entstanden ist.
 */

export function SliderClientBrief({
  text = "Die Website sollte mehr qualifizierte Anfragen generieren und das Vertrauen potenzieller Kunden stärken.",
}: { text?: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200/50 bg-white/80 backdrop-blur-sm px-4 py-3 text-sm text-slate-600 shadow-soft max-w-5xl mx-auto">
      <span className="font-semibold text-slate-900">Kundenwunsch im Beispiel:</span>{" "}
      {text}
    </div>
  );
}

