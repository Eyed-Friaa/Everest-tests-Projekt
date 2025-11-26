// ============================================================
// Lade-Steuerungsbefehle
// ============================================================

/**
 * Startet das Laden durch Klick auf CAR PLUGIN Button
 * @param {Object} options - Zusätzliche Optionen (Timeout, Force, etc.)
 */
Cypress.Commands.add('startCharging', (options = {}) => {
  const { timeout = 10000, force = true } = options
  
  cy.allure().step('Laden starten durch Klick auf CAR PLUGIN Button')
  
  cy.xpath("//button[@aria-label='buttonCar Plugin']", { timeout })
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force })
    
  cy.allure().parameter('action', 'start-charging')
})

/**
 * Stoppt das Laden durch Klick auf STOP & UNPLUG Button
 * @param {Object} options - Zusätzliche Optionen (Timeout, Force, etc.)
 */
Cypress.Commands.add('stopCharging', (options = {}) => {
  const { timeout = 10000, force = true } = options
  
  cy.allure().step('Laden stoppen durch Klick auf STOP & UNPLUG Button')
  
  cy.xpath("//button[@aria-label='buttonStop & Unplug']", { timeout })
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force })
    
  cy.allure().parameter('action', 'stop-charging')
})

/**
 * Pausiert das Laden durch Klick auf EV PAUSE Button
 */
Cypress.Commands.add('pauseCharging', (options = {}) => {
  const { timeout = 10000 } = options
  
  cy.allure().step('Laden pausieren')
  
  cy.xpath("//button[contains(@aria-label, 'Pause')]", { timeout })
    .should('be.visible')
    .click()
})

/**
 * Setzt das Laden fort durch Klick auf EV RESUME Button
 */
Cypress.Commands.add('resumeCharging', (options = {}) => {
  const { timeout = 10000 } = options
  
  cy.allure().step('Laden fortsetzen')
  
  cy.xpath("//button[contains(@aria-label, 'Resume')]", { timeout })
    .should('be.visible')
    .click()
})

// ============================================================
// kW-Verifizierungsbefehle
// ============================================================

/**
 * Überprüft, ob kW-Wert zwischen min und max liegt (inklusive)
 * @param {number} min - Minimaler erwarteter kW-Wert
 * @param {number} max - Maximaler erwarteter kW-Wert
 * @param {Object} options - Zusätzliche Optionen (Timeout, Wiederholungen)
 */
Cypress.Commands.add('verifyKW', (min, max, options = {}) => {
  const { timeout = 10000, retries = 3 } = options
  
  cy.allure().step(`Überprüfe, ob kW zwischen ${min} und ${max} liegt`)
  
  cy.xpath("(//*[name()='text'])[1]", { timeout })
    .should('exist')
    .invoke('text')
    .then((text) => {
      const value = parseFloat(text.replace(' kW', '').trim())
      
      cy.allure().parameter('expected-min-kw', min.toString())
      cy.allure().parameter('expected-max-kw', max.toString())
      cy.allure().parameter('actual-kw', value.toString())
      
      if (min !== null && min !== undefined) {
        expect(value, `kW-Wert ${value} sollte >= ${min} sein`).to.be.gte(min)
      }
      if (max !== null && max !== undefined) {
        expect(value, `kW-Wert ${value} sollte <= ${max} sein`).to.be.lte(max)
      }
    })
})

/**
 * Überprüft exakten kW-Textwert
 * @param {string} expectedText - Erwarteter Text (z.B. "0 kW")
 * @param {Object} options - Zusätzliche Optionen
 */
Cypress.Commands.add('verifyKWExact', (expectedText, options = {}) => {
  const { timeout = 10000 } = options
  
  cy.allure().step(`Überprüfe, ob kW-Text genau "${expectedText}" ist`)
  
  cy.xpath("(//*[name()='text'])[1]", { timeout })
    .should('exist')
    .invoke('text')
    .then((text) => {
      const actualText = text.trim()
      
      cy.allure().parameter('expected-kw-text', expectedText)
      cy.allure().parameter('actual-kw-text', actualText)
      
      expect(actualText, `Erwartet "${expectedText}" aber erhalten "${actualText}"`)
        .to.eq(expectedText)
    })
})

/**
 * Ruft aktuellen kW-Wert ab
 * @returns {Cypress.Chainable<number>} Aktueller kW-Wert
 */
Cypress.Commands.add('getCurrentKW', (options = {}) => {
  const { timeout = 10000 } = options
  
  return cy.xpath("(//*[name()='text'])[1]", { timeout })
    .should('exist')
    .invoke('text')
    .then((text) => {
      const value = parseFloat(text.replace(' kW', '').trim())
      cy.allure().parameter('current-kw', value.toString())
      return cy.wrap(value)
    })
})

// ============================================================
// UI-Element-Befehle
// ============================================================

/**
 * Wartet darauf, dass Anwendung bereit ist
 * Prüft Body-Element und Ready-State
 */
Cypress.Commands.add('waitForAppReady', (options = {}) => {
  const { timeout = 30000 } = options
  
  cy.allure().step('Warte auf Anwendungsbereitschaft')
  
  cy.get('body', { timeout })
    .should('exist')
    .should('be.visible')
    
  cy.document()
    .should('have.property', 'readyState', 'complete')
  
  // API-Stub sicherstellen, falls noch nicht vorhanden
  cy.window().then((win) => {
    if (typeof win.api === 'undefined') {
      win.api = {}
    }
  })
})

/**
 * Klickt auf einen Button über aria-label
 * @param {string} ariaLabel - Aria-label des Buttons
 * @param {Object} options - Zusätzliche Optionen
 */
Cypress.Commands.add('clickButtonByAriaLabel', (ariaLabel, options = {}) => {
  const { timeout = 10000, force = false } = options
  
  cy.allure().step(`Button mit aria-label klicken: ${ariaLabel}`)
  
  cy.xpath(`//button[@aria-label='${ariaLabel}']`, { timeout })
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force })
})

/**
 * Überprüft, ob UI-Element existiert und sichtbar ist
 * @param {string} elementText - Textinhalt oder Bezeichner
 * @param {Object} options - Zusätzliche Optionen
 */
Cypress.Commands.add('verifyUIElement', (elementText, options = {}) => {
  const { timeout = 10000, exactMatch = false } = options
  
  cy.allure().step(`Überprüfe, ob UI-Element existiert: ${elementText}`)
  
  if (exactMatch) {
    cy.contains(elementText, { timeout }).should('be.visible')
  } else {
    cy.contains(new RegExp(elementText, 'i'), { timeout })
      .should('be.visible')
  }
})

// ============================================================
// Dropdown-Befehle
// ============================================================

/**
 * Wählt Option aus Dropdown aus
 * @param {string} dropdownLabel - Bezeichnung oder Identifikator des Dropdowns
 * @param {string} optionValue - Auszuwählender Wert
 * @param {Object} options - Zusätzliche Optionen
 */
Cypress.Commands.add('selectFromDropdown', (dropdownLabel, optionValue, options = {}) => {
  const { timeout = 10000, byValue = true } = options
  
  cy.allure().step(`Wähle "${optionValue}" aus "${dropdownLabel}" Dropdown`)
  
  cy.get('select', { timeout })
    .first()
    .should('exist')
    .then(($select) => {
      if (byValue) {
        cy.wrap($select).select(optionValue)
      } else {
        cy.wrap($select).select(optionValue, { matchCase: false })
      }
    })
    
  cy.allure().parameter('dropdown', dropdownLabel)
  cy.allure().parameter('selected-option', optionValue)
})

// ============================================================
// Slider-Befehle
// ============================================================

/**
 * Setzt Slider-Wert
 * @param {string} sliderLabel - Bezeichnung oder Identifikator des Sliders
 * @param {string|number} value - Zu setzender Wert
 * @param {Object} options - Zusätzliche Optionen
 */
Cypress.Commands.add('setSliderValue', (sliderLabel, value, options = {}) => {
  const { timeout = 10000 } = options
  
  cy.allure().step(`Setze ${sliderLabel} Slider auf ${value}`)
  
  cy.get('input[type="range"]', { timeout })
    .first()
    .should('exist')
    .invoke('val', value)
    .trigger('input')
    .trigger('change')
    
  cy.allure().parameter('slider', sliderLabel)
  cy.allure().parameter('slider-value', value.toString())
  
  // Auf UI-Aktualisierung warten
  cy.wait(500)
})

/**
 * Ruft Slider-Wert ab
 * @param {string} sliderLabel - Bezeichnung oder Identifikator des Sliders
 * @returns {Cypress.Chainable<number>} Aktueller Slider-Wert
 */
Cypress.Commands.add('getSliderValue', (sliderLabel, options = {}) => {
  const { timeout = 10000 } = options
  
  return cy.get('input[type="range"]', { timeout })
    .first()
    .should('exist')
    .invoke('val')
    .then((value) => {
      cy.allure().parameter('slider', sliderLabel)
      cy.allure().parameter('current-slider-value', value.toString())
      return cy.wrap(parseFloat(value))
    })
})

// ============================================================
// Wiederholungsbefehle (für flaky Tests)
// ============================================================

/**
 * Wiederholt einen Befehl mit exponentiellem Backoff
 * @param {Function} commandFn - Zu wiederholende Befehlsfunktion
 * @param {Object} options - Wiederholungsoptionen
 */
Cypress.Commands.add('retryCommand', (commandFn, options = {}) => {
  const {
    retries = 3,
    delay = 1000,
    timeout = 10000,
  } = options
  
  const attempt = (currentRetry = 0) => {
    return cy.wrap(null, { timeout }).then(() => {
      return commandFn().catch((error) => {
        if (currentRetry < retries) {
          cy.allure().step(`Wiederholungsversuch ${currentRetry + 1} von ${retries}`)
          cy.wait(delay * (currentRetry + 1)) // Exponentielles Backoff
          return attempt(currentRetry + 1)
        }
        throw error
      })
    })
  }
  
  return attempt()
})

// ============================================================
// Assertion-Hilfsfunktionen
// ============================================================

/**
 * Wartet auf Element mit Wiederholungslogik
 * @param {string} selector - Element-Selektor
 * @param {Object} options - Warte-Optionen
 */
Cypress.Commands.add('waitForElement', (selector, options = {}) => {
  const {
    timeout = 10000,
    retries = 3,
    interval = 1000,
  } = options
  
  cy.allure().step(`Warte auf Element: ${selector}`)
  
  const checkElement = (attempt = 0) => {
    return cy.get('body', { timeout: interval })
      .then(($body) => {
        const $el = $body.find(selector)
        if ($el.length > 0 && $el.is(':visible')) {
          return cy.wrap($el)
        }
        if (attempt < retries) {
          cy.wait(interval)
          return checkElement(attempt + 1)
        }
        throw new Error(`Element ${selector} nach ${retries} Versuchen nicht gefunden`)
      })
  }
  
  return checkElement()
})
