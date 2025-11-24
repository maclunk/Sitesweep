'use client'

import { useState, useEffect } from 'react'

interface LoadingProps {
  currentStep?: number
}

export default function Loading({ currentStep: externalStep }: LoadingProps) {
  const [currentStep, setCurrentStep] = useState(externalStep || 0)

  const steps = [
    { label: 'Website wird geladen…' },
    { label: 'Fehler werden analysiert…' },
    { label: 'Bericht wird erstellt…' },
  ]

  // Auto-advance steps if no external step is provided
  useEffect(() => {
    if (externalStep !== undefined) {
      setCurrentStep(externalStep)
      return
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [externalStep])

  return (
    <div className="loading">
      <div className="loading-spinner">
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      <p className="loading-text">Analyse läuft…</p>
      <div className="loading-steps">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`loading-step ${index === currentStep ? 'active' : index < currentStep ? 'completed' : ''}`}
          >
            <span className="step-label">{step.label}</span>
          </div>
        ))}
      </div>
      <p className="loading-subtext">Dies kann einige Sekunden dauern</p>
    </div>
  )
}

