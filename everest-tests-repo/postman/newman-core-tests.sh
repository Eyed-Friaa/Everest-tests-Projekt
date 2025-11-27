#!/bin/bash

# Newman Test Runner für Core Functionality Tests
# Führt die drei Kern-Tests aus mit korrekter Wartezeit für Energy Charged Test

set -e

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

COLLECTION_FILE="EVerest-Demo-Core-Tests.postman_collection.json"
ENVIRONMENT_FILE="EVerest-Demo-Local.postman_environment.json"
REPORT_DIR="newman-reports-core"
ALLURE_RESULTS_DIR="../allure-results-postman-core"

echo -e "${GREEN}=== EVerest Demo - Core Functionality Tests ===${NC}\n"

# Prüfe Newman
if ! command -v newman &> /dev/null; then
    echo -e "${RED}Newman ist nicht installiert.${NC}"
    echo "Installiere mit: npm install -g newman newman-reporter-allure"
    exit 1
fi

# Erstelle Report-Verzeichnisse
mkdir -p "$REPORT_DIR"
mkdir -p "$ALLURE_RESULTS_DIR"

echo -e "${GREEN}Starte Core Functionality Tests...${NC}\n"
echo -e "${YELLOW}Hinweis: Test 3 verwendet --delay-request für 10 Sekunden Wartezeit${NC}\n"

# Führe Tests aus mit 10 Sekunden Delay zwischen Requests für Energy Charged Test
newman run "$COLLECTION_FILE" \
    -e "$ENVIRONMENT_FILE" \
    --reporters cli,json,allure \
    --reporter-json-export "$REPORT_DIR/newman-core-report.json" \
    --reporter-allure-export "$ALLURE_RESULTS_DIR" \
    --timeout-request 30000 \
    --delay-request 10000 \
    --bail \
    --verbose

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo -e "\n${GREEN}✓ Alle Core-Tests erfolgreich abgeschlossen!${NC}"
    echo -e "\n${YELLOW}Reports:${NC}"
    echo "  - JSON Report: $REPORT_DIR/newman-core-report.json"
    echo "  - Allure Results: $ALLURE_RESULTS_DIR"
else
    echo -e "\n${RED}✗ Einige Tests sind fehlgeschlagen (Exit Code: $EXIT_CODE)${NC}"
    exit $EXIT_CODE
fi
