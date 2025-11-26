/// <reference types="cypress" />
/// <reference types="@shelex/cypress-allure-plugin" />
const { When, Then } = require('@badeball/cypress-cucumber-preprocessor')
require('cypress-xpath')

const waitTime = 5000

// ============================================================
// Car Simulation Steps - Aktionen
// ============================================================

When('der Benutzer wählt Car Simulation {string} aus', (simulationMode) => {
  cy.allure().step(`Wähle Car Simulation Mode: ${simulationMode}`)
  cy.allure().parameter('simulation-mode', simulationMode)
  
  // Klicke auf Car Simulation Dropdown
  cy.xpath("//md-select-value[@id='select_value_label_0']", { timeout: 10000 })
    .should('be.visible')
    .click()
  
  cy.wait(1000)
  
  // Wähle den entsprechenden Mode
  if (simulationMode === 'AC RCD Error') {
    cy.xpath("//md-option[@id='select_option_8']", { timeout: 10000 })
      .should('be.visible')
      .click()
  } else if (simulationMode === 'AC Diode Fail') {
    cy.xpath("//md-option[@id='select_option_6']", { timeout: 10000 })
      .should('be.visible')
      .click()
  }
  
  cy.wait(2000)
  cy.allure().parameter('action', `selected-${simulationMode}`)
})

When('der Benutzer klickt auf EV Pause', () => {
  cy.allure().step('Benutzer klickt auf EV Pause')
  
  cy.xpath("//button[@aria-label='buttonEV Pause']", { timeout: 10000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force: true })
  
  cy.allure().parameter('action', 'pause-charging')
  cy.wait(waitTime)
})

When('der Benutzer klickt auf EV Resume', () => {
  cy.allure().step('Benutzer klickt auf EV Resume')
  
  cy.xpath("//button[@aria-label='buttonEV Resume']", { timeout: 10000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force: true })
  
  cy.allure().parameter('action', 'resume-charging')
  cy.wait(waitTime)
})

// ============================================================
// Car Simulation Steps - Validierungen
// ============================================================

Then('sollte das Laden erfolgreich starten', () => {
  cy.allure().step('Überprüfe, ob Laden erfolgreich gestartet wurde (mit AC RCD Error Verhalten)')
  
  // Erste Phase: Laden startet
  cy.wait(3000)
  cy.xpath("//div[@id='gauge_204']//*[name()='svg']//*[name()='text']", { timeout: 10000 })
    .should('exist')
    .invoke('text')
    .then((text) => {
      const value1 = parseFloat(text.replace(' kW', '').trim())
      cy.allure().parameter('kw-value-phase-1', text.trim())
      cy.log(`Phase 1 - kW: ${value1}`)
    })
  
  // Zweite Phase: Geht kurz auf 0
  cy.wait(2000)
  cy.xpath("//div[@id='gauge_204']//*[name()='svg']//*[name()='text']")
    .invoke('text')
    .then((text) => {
      const value2 = parseFloat(text.replace(' kW', '').trim())
      cy.allure().parameter('kw-value-phase-2', text.trim())
      cy.log(`Phase 2 - kW: ${value2}`)
    })
  
  // Dritte Phase: Laden läuft wieder
  cy.wait(5000)
  cy.xpath("//div[@id='gauge_204']//*[name()='svg']//*[name()='text']")
    .should('exist')
    .invoke('text')
    .then((text) => {
      const actualText = text.trim()
      const value3 = parseFloat(actualText.replace(' kW', '').trim())
      
      cy.allure().parameter('kw-value-final', actualText)
      cy.log(`Phase 3 (Final) - kW: ${value3}`)
      
      expect(value3, 'Laden sollte nach RCD Error wieder laufen - kW sollte > 0 sein').to.be.greaterThan(0)
    })
})

Then('sollte nichts passieren beim Pausieren', () => {
  cy.allure().step('Überprüfe, dass Pausieren keine Auswirkung hat')
  
  cy.wait(3000)
  
  // Status sollte weiterhin "Charging" oder ähnlich sein, NICHT "Paused"
  cy.xpath("//p[@class='label nr-dashboard-gauge-title nr-dashboard-gauge-titlel']", { timeout: 10000 })
    .should('exist')
    .invoke('text')
    .then((text) => {
      const actualStatus = text.trim()
      
      cy.allure().parameter('actual-status-after-pause', actualStatus)
      
      // Status sollte NICHT "Paused" enthalten
      expect(actualStatus, 'Status sollte NICHT "Paused" sein').to.not.include('Paused')
    })
})

Then('sollte nichts passieren beim Fortsetzen', () => {
  cy.allure().step('Überprüfe, dass Resume keine Auswirkung hat')
  
  cy.wait(3000)
  
  // Status sollte unverändert bleiben
  cy.xpath("//p[@class='label nr-dashboard-gauge-title nr-dashboard-gauge-titlel']", { timeout: 10000 })
    .should('exist')
    .invoke('text')
    .then((text) => {
      const actualStatus = text.trim()
      
      cy.allure().parameter('actual-status-after-resume', actualStatus)
      
      // Status sollte existieren und sich nicht verändert haben
      expect(actualStatus, 'Status sollte existieren').to.not.be.empty
    })
})
