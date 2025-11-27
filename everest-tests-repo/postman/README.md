# EVerest Demo - Postman API Test Collection

Umfassende Postman-Collection für die automatisierte API-Testierung der EVerest-Demo-Anwendung mit Newman-Integration und Allure-Reporting.

## 📋 Inhaltsverzeichnis

- [Übersicht](#übersicht)
- [Voraussetzungen](#voraussetzungen)
- [Installation](#installation)
- [Verwendung](#verwendung)
- [Collection-Struktur](#collection-struktur)
- [Umgebungsvariablen](#umgebungsvariablen)
- [CI/CD-Integration](#cicd-integration)
- [Allure-Reporting](#allure-reporting)
- [Best Practices](#best-practices)

## 📖 Übersicht

Diese Postman-Collection bietet:

- ✅ **Strukturierte Test-Suites** für alle API-Endpunkte
- ✅ **Automatisierte Validierungen** mit Statuscode- und Response-Zeit-Prüfungen
- ✅ **Umgebungsvariablen** für flexible Konfiguration
- ✅ **Pre-request Scripts** für dynamische Datengenerierung
- ✅ **Test Scripts** für umfassende Assertions
- ✅ **Newman-Integration** für CI/CD-Pipelines
- ✅ **Allure-Reporting** für detaillierte Test-Reports

## 🔧 Voraussetzungen

- **Node.js** (v14 oder höher)
- **npm** oder **yarn**
- **Postman** (für manuelle Ausführung) oder **Newman** (für CLI/CI)
- **EVerest Demo** läuft und ist erreichbar

## 📦 Installation

### 1. Newman installieren

```bash
npm install -g newman newman-reporter-allure
```

### 2. Postman-Collection importieren

**Option A: Über Postman App**
1. Öffne Postman
2. Klicke auf "Import"
3. Wähle `EVerest-Demo-API.postman_collection.json`
4. Importiere die Umgebungsdatei(n) aus dem `postman/` Verzeichnis

**Option B: Über CLI**
```bash
cd postman
# Collection und Environment werden automatisch erkannt
```

## 🚀 Verwendung

### Manuelle Ausführung in Postman

1. **Umgebung auswählen**
   - Wähle "EVerest Demo - Local" oder "EVerest Demo - Staging"
   - Stelle sicher, dass die `base_url` korrekt ist

2. **Collection ausführen**
   - Öffne die Collection "EVerest Demo API - Comprehensive Test Suite"
   - Klicke auf "Run" oder führe einzelne Requests aus

### Automatisierte Ausführung mit Newman

#### Lokale Ausführung

```bash
cd postman
chmod +x newman-run.sh
./newman-run.sh
```

#### Mit spezifischer Umgebung

```bash
cd postman
newman run EVerest-Demo-API.postman_collection.json \
    -e EVerest-Demo-Local.postman_environment.json \
    --reporters cli,json,allure \
    --reporter-allure-export ../allure-results-postman
```

#### CI/CD-Ausführung

```bash
cd postman
chmod +x newman-ci.sh
./newman-ci.sh EVerest-Demo-Staging.postman_environment.json
```

## 📁 Collection-Struktur

Die Collection ist in folgende Bereiche unterteilt:

### 1. Health & Status Checks
- Node-RED Health Check
- UI Status Check
- Flows API Status

### 2. Node-RED API Endpoints
- Get All Flows
- Get Single Flow
- Get Node-RED Settings

### 3. UI Endpoints
- Load Demo UI
- UI Assets (CSS, JavaScript)

### 4. Admin Panel API
- Config Endpoint
- Status Endpoint

### 5. Error Handling Tests
- Invalid Endpoint (404 Check)
- Invalid Method (405 Check)
- Malformed Request

### 6. Performance Tests
- UI Load Performance
- Concurrent Requests Test

### 7. Integration Tests
- End-to-End Workflow Tests

## 🔐 Umgebungsvariablen

### Standard-Variablen

| Variable | Beschreibung | Standard (Local) |
|----------|-------------|------------------|
| `base_url` | Basis-URL der Demo | `http://localhost:1880` |
| `admin_panel_url` | Admin-Panel URL | `http://localhost:8849` |
| `api_timeout` | Request-Timeout (ms) | `10000` |

### Dynamische Variablen (werden automatisch gesetzt)

- `session_id`: Eindeutige Session-ID für Test-Run
- `request_count`: Zähler für Requests
- `current_request_id`: Aktuelle Request-ID
- `test_results`: JSON-Array mit Test-Ergebnissen
- `flows_count`: Anzahl der Flows
- `ui_load_time`: UI-Ladezeit in ms
- `workflow_step`: Aktueller Workflow-Schritt

## 🔄 CI/CD-Integration

### GitHub Actions Beispiel

```yaml
name: Postman API Tests

on: [push, pull_request]

jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Newman
        run: npm install -g newman newman-reporter-allure
      
      - name: Start EVerest Demo
        run: |
          curl https://raw.githubusercontent.com/everest/everest-demo/main/demo-ac.sh | bash
          sleep 30  # Warte auf Start
      
      - name: Run Postman Tests
        run: |
          cd postman
          chmod +x newman-ci.sh
          ./newman-ci.sh
      
      - name: Generate Allure Report
        run: |
          npm install -g allure-commandline
          allure generate allure-results-postman -o allure-report-postman
      
      - name: Upload Allure Report
        uses: actions/upload-artifact@v3
        with:
          name: allure-report-postman
          path: allure-report-postman/
```

### Jenkins Pipeline Beispiel

```groovy
pipeline {
    agent any
    
    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install -g newman newman-reporter-allure'
            }
        }
        
        stage('Run API Tests') {
            steps {
                dir('postman') {
                    sh './newman-ci.sh'
                }
            }
        }
        
        stage('Generate Allure Report') {
            steps {
                sh 'allure generate allure-results-postman -o allure-report-postman'
                publishHTML([
                    reportDir: 'allure-report-postman',
                    reportFiles: 'index.html',
                    reportName: 'Allure Report'
                ])
            }
        }
    }
}
```

## 📊 Allure-Reporting

### Allure Report generieren

```bash
# Nach Newman-Ausführung
cd ..
allure generate allure-results-postman -o allure-report-postman
allure open allure-report-postman
```

### Allure-Integration in package.json

Füge folgende Scripts zur `package.json` hinzu:

```json
{
  "scripts": {
    "test:postman": "cd postman && newman run EVerest-Demo-API.postman_collection.json -e EVerest-Demo-Local.postman_environment.json --reporters cli,allure --reporter-allure-export ../allure-results-postman",
    "test:postman:ci": "cd postman && ./newman-ci.sh",
    "report:postman:allure": "allure generate allure-results-postman -o allure-report-postman && allure open allure-report-postman"
  }
}
```

### Allure-Metriken

Die Collection protokolliert automatisch:
- ✅ Response-Zeiten
- ✅ Status-Codes
- ✅ Request-Namen
- ✅ Timestamps
- ✅ Test-Ergebnisse

Diese werden in Allure-Reports visualisiert.

## 💡 Best Practices

### 1. Umgebungsvariablen verwenden

```javascript
// ✅ Gut
pm.request.url = pm.environment.get('base_url') + '/api/endpoint';

// ❌ Schlecht
pm.request.url = 'http://localhost:1880/api/endpoint';
```

### 2. Fehlerbehandlung

```javascript
pm.test('Status Code Check', function () {
    if (pm.response.code >= 200 && pm.response.code < 300) {
        pm.response.to.have.status(pm.response.code);
    } else {
        // Logging für Debugging
        console.log('Unexpected status:', pm.response.code);
    }
});
```

### 3. Response-Zeit-Monitoring

```javascript
pm.test('Performance Check', function () {
    const maxResponseTime = parseInt(pm.environment.get('api_timeout'));
    pm.expect(pm.response.responseTime).to.be.below(maxResponseTime);
});
```

### 4. Datenvalidierung

```javascript
pm.test('Response Schema Validation', function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('type');
    pm.expect(jsonData.id).to.be.a('string');
});
```

## 🛠️ Wartung

### Neue Requests hinzufügen

1. Erstelle neuen Request in Postman
2. Füge Pre-request Scripts hinzu (falls nötig)
3. Füge Test Scripts hinzu
4. Exportiere Collection neu
5. Committe Änderungen

### Umgebungsvariablen aktualisieren

1. Öffne Environment-Datei in Postman
2. Bearbeite Variablen
3. Exportiere Environment neu
4. Committe Änderungen

## 📝 Troubleshooting

### Newman nicht gefunden
```bash
# Prüfe Installation
which newman

# Neu installieren
npm install -g newman newman-reporter-allure
```

### Collection nicht gefunden
```bash
# Prüfe Pfad
ls -la postman/EVerest-Demo-API.postman_collection.json

# Führe von korrektem Verzeichnis aus
cd postman
```

### Allure Report leer
- Prüfe, ob `allure-results-postman/` Verzeichnis existiert
- Prüfe, ob Newman mit `--reporter-allure-export` ausgeführt wurde
- Prüfe Logs auf Fehler

## 📚 Ressourcen

- [Postman Dokumentation](https://learning.postman.com/docs/)
- [Newman Dokumentation](https://github.com/postmanlabs/newman)
- [Allure Reporting](https://docs.qameta.io/allure/)
- [EVerest Dokumentation](https://everest.github.io/nightly/)

## 🤝 Beitragen

Bei Verbesserungsvorschlägen:
1. Erstelle Issue oder Pull Request
2. Dokumentiere Änderungen
3. Teste mit verschiedenen Umgebungen
4. Aktualisiere diese README

---

**Version**: 1.0.0  
**Letzte Aktualisierung**: 2024  
**Wartung**: Test Automation Team
