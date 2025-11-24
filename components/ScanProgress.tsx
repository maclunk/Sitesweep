'use client'

import { useState, useEffect } from 'react'

interface ScanProgressProps {
  isActive: boolean
}

export default function ScanProgress({ isActive }: ScanProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { label: 'Website wird geladen', id: 'loading' },
    { label: 'Fehler werden analysiert', id: 'analyzing' },
    { label: 'Bericht wird erstellt', id: 'reporting' },
  ]

  useEffect(() => {
    if (!isActive) {
      setCurrentStep(0)
      return
    }

    // Auto-advance steps every 3 seconds
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        return prev // Stay on last step
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <div className="scan-progress-card">
      <div className="scan-progress-header">
        <div className="scan-progress-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <h2 className="scan-progress-title">Analyse läuft…</h2>
        <p className="scan-progress-subtitle">
          Wir prüfen Ihre Website auf technische, SEO-, rechtliche und UX-Probleme.
        </p>
      </div>

      <div className="scan-progress-steps">
        {steps.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep

          return (
            <div
              key={step.id}
              className={`scan-progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="scan-progress-step-icon">
                {isCompleted && (
                  <span className="step-checkmark">✓</span>
                )}
              </div>
              <div className="scan-progress-step-content">
                <div className="scan-progress-step-label">{step.label}</div>
                {isActive && <div className="scan-progress-step-pulse"></div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

