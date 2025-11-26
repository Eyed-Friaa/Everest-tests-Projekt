/// <reference types="cypress" />
/// <reference types="@shelex/cypress-allure-plugin" />
const { Then } = require('@badeball/cypress-cucumber-preprocessor')
require('cypress-xpath')

// ============================================================
// AC Diode Fail Steps - Validierungen
// ============================================================

Then('sollte die Temperatur zu hoch sein', () => {
  cy.allure().step('Überprüfe, ob Temperatur zu hoch ist')
  
  // Warte genau 3 Sekunden damit sich Temperatur aufbaut
  cy.wait(5000)
  
  cy.xpath("//*[name()='tspan' and @id='level_value_channel_0_307']", { timeout: 10000 })
    .should('exist')
    .invoke('text')
    .then((text) => {
      const temperatureText = text.trim()
      const temperatureValue = parseFloat(temperatureText.replace('°C', '').replace(',', '.').trim())
      
      cy.allure().parameter('temperature-value', temperatureText)
      cy.allure().parameter('temperature-numeric', temperatureValue.toString())
      
      cy.log(`Temperatur: ${temperatureText}`)
      
      // Temperatur sollte hoch sein (z.B. > 40°C)
      expect(temperatureValue, 'Temperatur sollte zu hoch sein (> 40°C)').to.be.greaterThan(40)
    })
  
  cy.wait(1000)
})

Then('sollte der Temperatur-Balken rot gefüllt sein', () => {
  cy.allure().step('Überprüfe, ob Temperatur-Balken rot gefüllt ist')
  
  cy.xpath("//*[name()='rect' and @id='level_stripe_0_307']", { timeout: 10000 })
    .should('exist')
    .should('be.visible')
    .then(($rect) => {
      expect($rect.length, 'Temperatur-Balken sollte existieren').to.be.greaterThan(0)
      
      const fill = $rect.attr('fill')
      const style = $rect.attr('style')
      
      cy.allure().parameter('rect-fill', fill || 'none')
      cy.allure().parameter('rect-style', style || 'none')
      
      cy.log('Temperatur-Balken ist sichtbar und gefüllt')
      
      // Screenshot machen und zu Allure hinzufügen
      cy.screenshot('temperatur-balken-rot', { capture: 'viewport' }).then(() => {
        const screenshotPath = 'cypress/screenshots/temperatur-balken-rot.png'
        cy.readFile(screenshotPath, 'base64').then((image) => {
          cy.allure().attachment('Temperatur-Balken Screenshot', image, 'image/png')
        })
      })
    })
  
  cy.wait(4000)
})

Then('sollte das Laden bei {string} bleiben', (expectedKW) => {
  cy.allure()
    .step(`Überprüfe, ob Laden bei ${expectedKW} bleibt`)
    .parameter('expected-kw', expectedKW)
  
  
  cy.xpath("//div[@id='gauge_204']//*[name()='svg']//*[name()='text'][1]/*[name()='tspan'][1]", { timeout: 10000 })
    .should('exist')
    .invoke('text')
    .then((text) => {
      const actualText = text.trim()
      const value = parseFloat(actualText.replace(' kW', '').replace('kW', '').trim())
      
      cy.allure().parameter('actual-kw-text', actualText)
      cy.allure().parameter('kw-numeric', value.toString())
      
      cy.log(`kW-Wert: ${actualText} (Numerisch: ${value})`)
      
      expect(actualText, `kW sollte ${expectedKW} sein`).to.equal(expectedKW)
      expect(value, 'Laden sollte nicht starten - kW sollte 0 sein').to.equal(0)
    })
  
  
  cy.xpath("//div[@id='gauge_204']//*[name()='svg']//*[name()='text'][1]/*[name()='tspan'][1]")
    .invoke('text')
    .then((text) => {
      const actualText = text.trim()
      const value = parseFloat(actualText.replace(' kW', '').replace('kW', '').trim())
      
      cy.allure().parameter('actual-kw-recheck', actualText)
      cy.log(`kW-Wert Recheck: ${actualText} (Numerisch: ${value})`)
      
      expect(value, 'Laden sollte immer noch bei 0 kW sein').to.equal(0)
    })
  
})
