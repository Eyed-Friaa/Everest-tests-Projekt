/// <reference types="cypress" />
/// <reference types="@shelex/cypress-allure-plugin" />
const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor')
require('cypress-xpath')


const waitTime = 10000


// ============================================================
// Car Plugin Steps - Vorbedingungen
// ============================================================


Given('der Benutzer ist auf der Ladeseite', () => {
  cy.allure().step('Navigiere zur Ladeseite')
  cy.visit('/', {
    onBeforeLoad(win) {
      // API-Stub vor dem Laden der Seite injizieren, um ReferenceError zu vermeiden
      win.api = win.api || {}
    }
  })
  cy.waitForAppReady()
  
  // Zusätzliche Wartezeit nach dem Laden für Video-Aufzeichnung
  cy.wait(2000)
})


// ============================================================
// Car Plugin Steps - Aktionen
// ============================================================


When('der Benutzer das Car Plugin aktiviert', () => {
  cy.allure().step('Benutzer aktiviert Car Plugin')
  
  cy.xpath("//button[@aria-label='buttonCar Plugin']", { timeout: 10000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force: true })
  
  cy.allure().parameter('action', 'activate-car-plugin')
})


When('der Benutzer das Car Plugin aussteckt', () => {
  cy.allure().step('Benutzer steckt Car Plugin aus (Stop & Unplug)')
  
  cy.xpath("//button[@aria-label='buttonStop & Unplug']", { timeout: 10000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force: true })
  
  cy.allure().parameter('action', 'unplug-car')
})


// ============================================================
// Car Plugin Steps - Validierungen
// ============================================================


Then('sollte der kW-Wert nicht mehr {string} sein', (expectedValue) => {
  cy.allure()
    .step(`Überprüfe, ob kW-Wert nicht mehr ${expectedValue} ist`)
    .parameter('expected-not-value', expectedValue)
  
  cy.xpath("//div[@id='gauge_204']//*[name()='svg']//*[name()='text']", { timeout: 10000 })
    .should('exist')
    .invoke('text')
    .then((text) => {
      const actualText = text.trim()
      
      cy.allure().parameter('actual-kw-text', actualText)
      
      expect(actualText, `kW-Wert sollte nicht ${expectedValue} sein`).to.not.equal(expectedValue)
    })
})


Then('sollte der kW-Wert {string} sein', (expectedValue) => {
  cy.allure()
    .step(`Überprüfe, ob kW-Wert ${expectedValue} ist`)
    .parameter('expected-value', expectedValue)
  
  cy.xpath("//div[@id='gauge_204']//*[name()='svg']//*[name()='text'][1]/*[name()='tspan'][1]", { timeout: 10000 })
    .should('exist')
    .invoke('text')
    .then((text) => {
      const actualText = text.trim()
      
      cy.allure().parameter('actual-kw-text', actualText)
      
      expect(actualText, `kW-Wert sollte ${expectedValue} sein`).to.equal(expectedValue)
    })
})


Then('sollte das Laden aktiv sein', () => {
  cy.allure().step('Überprüfe, ob Laden aktiv ist (kW > 0)')
  
  cy.xpath("//div[@id='gauge_204']//*[name()='svg']//*[name()='text']", { timeout: 10000 })
    .should('exist')
    .invoke('text')
    .then((text) => {
      const value = parseFloat(text.replace(' kW', '').trim())
      cy.allure().parameter('current-kw-value', value.toString())
      
      expect(value, 'Laden sollte aktiv sein (kW > 0)').to.be.greaterThan(0)
    })
})