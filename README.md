# Automatisiertes Testframework für EVerest – Bachelorarbeit

Dieses Repository beinhaltet das im Rahmen der Bachelorarbeit entwickelte Testframework zur Validierung des EVerest-Ladesystems. Es kombiniert automatisierte End-to-End-Tests mit Cypress und Cucumber, API-Tests über Maven sowie ein Python-basiertes interaktives Tool zur Analyse von MQTT-Kommunikation, Ladezuständen und Systemreaktionen. Zusätzlich werden Allure Reports zur standardisierten Testauswertung eingesetzt.

Das Framework ermöglicht die automatisierte Prüfung von:

- Ladeprozess und Benutzerinteraktionen in der EVerest-UI (Cypress)
- Backend- und API-Funktionalitäten (Maven/Java)
- MQTT-basierter Kommunikation und Ladezyklusverhalten (Python)
- Konsistenz von Zustandswechseln, Fehlererkennung und Echtzeitüberwachung

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
```

---

## 1. End-to-End-Tests mit Cypress, Cucumber und Allure

Die UI-Tests überprüfen das Verhalten der EVerest-Ladeoberfläche, insbesondere:

- Aktivieren und Deaktivieren des Car Plugins
- Überwachung des Ladefortschritts
- Validierung von kW-Anzeigen
- Sicherstellung, dass aktive Ladevorgänge korrekt erfasst werden

### Beispiel für Step Definitions  
Quelle: :contentReference[oaicite:0]{index=0}

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

### Headless-Testausführung mit Allure

```
npm run test
npm run allure:generate
npm run allure:open
```

---

## 2. API-Tests mit Maven und Java

Die Datei `EverestFullApiTests.java` umfasst API-Testfälle zur Überprüfung von Backend-Funktionalitäten, beispielsweise zur Erstellung und Verwaltung von Ladesessions oder Statusabfragen.

Beispiel (verkürzt):  
Quelle: 

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

Das Python-Skript `interactive_everest_test.py` ermöglicht eine detaillierte Analyse der Ladeprozesse im EVerest-System und bietet:

- Live-Monitoring von MQTT-Nachrichten
- Erkennung von Zustandsänderungen des Ladesystems
- Dokumentation kompletter Ladezyklen
- Erfassung relevanter Fehlerzustände
- Integration der Node-RED Oberfläche
- Echtzeitstatistiken und interaktive Steuerung

Beispiel: Zustandsüberwachung  
Quelle: :contentReference[oaicite:2]{index=2}

```python
if "session_info" in msg.topic and "state" in str(data):
    self.handle_state_change(msg.topic, data)
```

Start des Tools:

```
python3 interactive_everest_test.py
```

Das Tool bietet ein interaktives Terminalmenü, mit dem Statistiken, Ladezyklen, Fehlerberichte und Performancekennzahlen abgerufen werden können.

---

## 4. Allure-Reporting

Das Framework verwendet Allure zur konsistenten Dokumentation und Visualisierung der Testergebnisse aus:

- Cypress-E2E-Tests
- Maven-API-Tests

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
- MQTT-Broker (z. B. Mosquitto)  
- Laufende EVerest-Instanz  
- Node-RED Dashboard  

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

Ein Auszug eines Feature-Files:  
Quelle: 

```
Scenario: AC-Diode Fail Temperature
  Given ...
  When ...
  Then ...
```

---

## Zielsetzung der Arbeit

Ziel dieses Testframeworks ist die systematische und reproduzierbare Validierung der EVerest-Ladeinfrastruktur. Dazu gehören:

- Sicherstellung korrekter UI-, API- und MQTT-Kommunikation  
- Automatisierte Ladezyklus-Analyse  
- Erkennung und Klassifikation relevanter Fehlermeldungen  
- Strukturierte Testberichterstattung mittels Allure  
- Ganzheitliche Bewertung des Systemverhaltens unter realitätsnahen Bedingungen  

---

## Lizenz

Dieses Projekt verwendet die MIT-Lizenz.
