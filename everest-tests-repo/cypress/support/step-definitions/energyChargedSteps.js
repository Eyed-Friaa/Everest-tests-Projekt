/// <reference types="cypress" />
/// <reference types="@shelex/cypress-allure-plugin" />
const { When, Then } = require('@badeball/cypress-cucumber-preprocessor')
require('cypress-xpath')

// ============================================================
// Energy Charged Steps - Aktionen
// ============================================================

When('der Benutzer wartet {int} Sekunden', (seconds) => {
  cy.allure().step(`Warte ${seconds} Sekunden`)
  cy.allure().parameter('wait-time', `${seconds}s`)
  
  cy.wait(seconds * 1000)
})

// ============================================================
// Energy Charged Steps - Validierungen
// ============================================================

Then('sollte Energy Charged angezeigt werden', () => {
  cy.allure().step('Überprüfe, ob Energy Charged Label sichtbar ist')
  
  cy.xpath("//p[normalize-space()='Energy Charged']", { timeout: 10000 })
    .should('exist')
    .should('be.visible')
  
  cy.allure().parameter('validation', 'Energy Charged Label visible')
})

Then('sollte Energy Charged mehr als {string} sein', (expectedMinValue) => {
  cy.allure()
    .step(`Überprüfe, ob Energy Charged mehr als ${expectedMinValue} ist`)
    .parameter('expected-min-value', expectedMinValue)
  
  // Suche nach dem Energy Charged Wert-Element
  cy.xpath("//p[normalize-space()='Energy Charged']/following-sibling::p", { timeout: 10000 })
    .should('exist')
    .invoke('text')
    .then((text) => {
      const actualText = text.trim()
      cy.allure().parameter('actual-energy-charged', actualText)
      
      // Extrahiere den numerischen Wert
      const actualValue = parseFloat(actualText.replace(' kWh', '').replace(',', '.'))
      const minValue = parseFloat(expectedMinValue.replace(' kWh', '').replace(',', '.'))
      
      cy.allure().parameter('actual-value-numeric', actualValue.toString())
      cy.allure().parameter('min-value-numeric', minValue.toString())
      
      expect(actualValue, `Energy Charged sollte größer als ${minValue} kWh sein`).to.be.greaterThan(minValue)
      expect(actualText, `Energy Charged sollte nicht "${expectedMinValue}" sein`).to.not.equal(expectedMinValue)
    })
})
