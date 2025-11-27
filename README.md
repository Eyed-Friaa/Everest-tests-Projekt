# Automatisiertes Testframework für EVerest – Bachelorarbeit

Dieses Repository enthält das im Rahmen der Bachelorarbeit entwickelte Testframework zur systematischen Validierung des EVerest-Ladesystems. Das Framework kombiniert mehrere automatisierte Testansätze: End-to-End-Tests mit Cypress und Cucumber, API-Tests auf Basis von Maven und Java, ein Python-basiertes Werkzeug zur Analyse der MQTT-Kommunikation sowie Postman-Sammlungen zur ergänzenden Schnittstellenprüfung. Alle Testkomponenten werden durch Allure Reports konsistent dokumentiert und ausgewertet.

Das Testframework ermöglicht die automatisierte Prüfung von:
- Benutzerinteraktionen und Ladeverhalten in der EVerest-UI (Cypress/Cucumber)
- Backend- und API-Funktionalitäten des Ladesystems (Maven/Java)
- MQTT-basierter Systemkommunikation, Fehlerereignissen und Ladezyklen (Python)
- Postman-API-Collections zur strukturierten Validierung einzelner Schnittstellen
- Konsistenz und Stabilität von Zustandswechseln, Fehlererkennung und Systemreaktionen

---

## Projektstruktur

```
/cypress
  /e2e
    *.feature
  /support
  carPluginSteps.js

/mvn-tests
  EverestFullApiTests.java

/python
  interactive_everest_test.py

/postman
  EVerest-Demo-Core-Tests.postman_collection.json
  EVerest-Demo-API.postman_collection.json
  EVerest-Demo-Local.postman_environment.json
```

---

## 1. End-to-End-Tests mit Cypress, Cucumber und Allure

Die End-to-End-Tests überprüfen das Verhalten der Benutzeroberfläche entlang realer Ladeszenarien, darunter das Aktivieren und Deaktivieren des Car Plugins, die Überwachung des Ladefortschritts sowie die Validierung der Leistungsanzeigen.

### Beispiel einer Step Definition

```js
When('der Benutzer das Car Plugin aktiviert', () => {
  cy.allure().step('Benutzer aktiviert Car Plugin')
  cy.xpath("//button[@aria-label='buttonCar Plugin']", { timeout: 10000 })
    .should('be.visible')
    .should('not.be.disabled')
    .click({ force: true })
})
```

### Ausführung der Cypress Tests

```
npm install
npx cypress open
```

### Headless-Testausführung und Allure Report

```
npm run test
npm run allure:generate
npm run allure:open
```

---

## 2. API-Tests mit Maven und Java

Die Datei `EverestFullApiTests.java` umfasst API-Testfälle zur Überprüfung der Backend-Schnittstellen. Diese Tests validieren unter anderem das Session-Handling, Ladezustände und allgemeine Systemreaktionen.

### Beispiel (verkürzt)

```java
public class EverestFullApiTests {
    @Test
    public void testChargingSessionCreation() {
        // Testet, ob eine neue Session erfolgreich erstellt werden kann
    }
}
```

### Ausführung der Maven Tests

```
mvn clean test
```

### Allure Report erzeugen

```
mvn allure:serve
```

---

## 3. Interaktiver Python-Tester zur Analyse von MQTT-Ladeprozessen

Das Python-Skript `interactive_everest_test.py` dient der Echtzeitanalyse der Ladeinfrastruktur. Es überwacht MQTT-Nachrichten, identifiziert Zustandsänderungen, dokumentiert Ladezyklen und unterstützt manuelle Interaktionen über Node-RED.

### Beispiel zur Zustandsüberwachung

```python
if "session_info" in msg.topic and "state" in str(data):
    self.handle_state_change(msg.topic, data)
```

### Ausführung des Tools

```
python3 interactive_everest_test.py
```

Das Tool stellt ein interaktives Terminalmenü bereit, über das Statistiken, Ladezyklen, Fehlerberichte und Performanceindikatoren abgerufen werden können.

---

## 4. Postman Collections

Das Projekt enthält mehrere Postman-Sammlungen zur strukturierten API-Validierung:

- EVerest-Demo-Core-Tests.postman_collection.json  
- EVerest-Demo-API.postman_collection.json  
- EVerest-Demo-Local.postman_environment.json  

Diese Dateien können direkt in Postman importiert werden.

---

## 5. Allure Reporting

Alle Testarten erzeugen Allure-kompatible Ergebnisdateien, welche eine zentrale und transparente Auswertung der Testergebnisse ermöglichen.

### Installation der Allure-CLI

```
npm install -g allure-commandline --save-dev
```

### Report generieren und anzeigen

```
allure generate allure-results --clean
allure open
```

---

## Voraussetzungen

- Node.js 18 oder höher
- Java 17 und Maven
- Python 3.10 oder höher
- MQTT-Broker wie Mosquitto
- EVerest-Ladeinfrastruktur
- Node-RED Dashboard
- Postman (optional)

---

## Installation

### Repository klonen

```
git clone https://github.com/<dein-repo>.git
cd <dein-repo>
```

### Abhängigkeiten installieren

#### Cypress

```
npm install
```

#### Maven

```
mvn clean install
```

#### Python

```
pip3 install -r requirements.txt
```

---

## BDD-Features

Beispiel eines Feature-Files:

```
Scenario: AC-Diode Fail Temperature
  Given ...
  When ...
  Then ...
```

---

## Zielsetzung der Arbeit

Ziel dieses Testframeworks ist die reproduzierbare und umfassende Validierung der EVerest-Ladeinfrastruktur. Dies umfasst die Prüfung der Kommunikationswege zwischen UI, Backend und MQTT, die Analyse kompletter Ladezyklen sowie die automatisierte Erkennung von Fehlerzuständen. Durch die Integration aller Testmethoden in ein konsistentes Reporting wird eine fundierte Bewertung der Systemstabilität und -funktionalität unter praxisnahen Bedingungen ermöglicht.

---

## Lizenz

Dieses Projekt verwendet die MIT-Lizenz.
