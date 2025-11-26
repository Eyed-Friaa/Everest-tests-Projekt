// ***********************************************************
// Cypress E2E Support-Datei
// ***********************************************************

// Benutzerdefinierte Befehle importieren
import './commands'
import 'cypress-xpath'

// Allure-Reporter für erweiterte Testberichte importieren
import '@shelex/cypress-allure-plugin/reporter'

// ============================================================
// Screenshot & Video Konfiguration
// ============================================================

Cypress.Screenshot.defaults({
  screenshotOnRunFailure: true,
  capture: 'viewport',
  scale: true,
  disableTimersAndAnimations: true,
})

// ============================================================
// Fehlerbehandlung
// ============================================================

Cypress.on('uncaught:exception', (err, runnable) => {
  console.warn('Ignoriere uncaught exception:', err && err.message ? err.message : err)
  return false
})

// ============================================================
// API-Stub
// ============================================================

Cypress.on('window:before:load', (win) => {
  win.api = win.api || {}
})

// ============================================================
// Allure Integration
// ============================================================

beforeEach(() => {
  if (Cypress.env('allure')) {
    cy.allure()
      .tag('everest-demo')
      .tag(Cypress.env('environment') || 'local')
  }
})

// Leistungsmetriken für Allure
Cypress.Commands.add('capturePerformanceMetrics', () => {
  cy.window().then((win) => {
    if (win.performance && win.performance.timing) {
      const perf = win.performance.timing
      const metrics = {
        dns: perf.domainLookupEnd - perf.domainLookupStart,
        connection: perf.connectEnd - perf.connectStart,
        request: perf.responseStart - perf.requestStart,
        response: perf.responseEnd - perf.responseStart,
        domLoading: perf.domContentLoadedEventEnd - perf.navigationStart,
        pageLoad: perf.loadEventEnd - perf.navigationStart,
      }
      
      if (Cypress.env('allure')) {
        Object.entries(metrics).forEach(([key, value]) => {
          cy.allure().parameter(`perf-${key}`, `${value}ms`)
        })
        cy.allure().addAttachment('performance-metrics', JSON.stringify(metrics, null, 2), 'application/json')
      }
      
      return cy.wrap(metrics)
    }
  })
})
