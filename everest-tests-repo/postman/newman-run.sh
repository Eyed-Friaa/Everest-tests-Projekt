#!/bin/bash

# Newman Test Runner Script für EVerest Demo API Tests
# Ermöglicht die Ausführung der Postman-Collection über Newman mit Allure-Reporting

set -e

# Farben für Output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Konfiguration
COLLECTION_FILE="EVerest-Demo-API.postman_collection.json"
ENVIRONMENT_FILE="EVerest-Demo-Local.postman_environment.json"
REPORT_DIR="newman-reports"
ALLURE_RESULTS_DIR="../allure-results-postman"

echo -e "${GREEN}=== EVerest Demo API - Newman Test Runner ===${NC}\n"

# Prüfe, ob Newman installiert ist
if ! command -v newman &> /dev/null; then
    echo -e "${RED}Newman ist nicht installiert.${NC}"
    echo "Installiere mit: npm install -g newman newman-reporter-allure"
    exit 1
fi

# Prüfe, ob Collection-Datei existiert
if [ ! -f "$COLLECTION_FILE" ]; then
    echo -e "${RED}Collection-Datei nicht gefunden: $COLLECTION_FILE${NC}"
    exit 1
fi

# Prüfe, ob Environment-Datei existiert
if [ ! -f "$ENVIRONMENT_FILE" ]; then
    echo -e "${YELLOW}Warnung: Environment-Datei nicht gefunden: $ENVIRONMENT_FILE${NC}"
    echo "Verwende Standard-Umgebungsvariablen"
    ENV_FLAG=""
else
    ENV_FLAG="-e $ENVIRONMENT_FILE"
fi

# Erstelle Report-Verzeichnisse
mkdir -p "$REPORT_DIR"
mkdir -p "$ALLURE_RESULTS_DIR"

echo -e "${GREEN}Starte Test-Ausführung...${NC}\n"

# Führe Newman-Tests aus
newman run "$COLLECTION_FILE" \
    $ENV_FLAG \
    --reporters cli,json,allure \
    --reporter-json-export "$REPORT_DIR/newman-report.json" \
    --reporter-allure-export "$ALLURE_RESULTS_DIR" \
    --timeout-request 30000 \
    --delay-request 500 \
    --bail \
    --verbose

# Prüfe Exit-Status
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "\n${GREEN}✓ Alle Tests erfolgreich abgeschlossen!${NC}"
    echo -e "\n${YELLOW}Reports:${NC}"
    echo "  - JSON Report: $REPORT_DIR/newman-report.json"
    echo "  - Allure Results: $ALLURE_RESULTS_DIR"
    echo -e "\n${YELLOW}Allure Report generieren mit:${NC}"
    echo "  cd .. && npm run allure:generate"
else
    echo -e "\n${RED}✗ Einige Tests sind fehlgeschlagen (Exit Code: $EXIT_CODE)${NC}"
    exit $EXIT_CODE
fi
