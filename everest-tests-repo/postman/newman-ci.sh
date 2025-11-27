#!/bin/bash

# CI/CD Newman Test Runner für EVerest Demo API Tests
# Optimiert für kontinuierliche Integration mit detailliertem Reporting

set -e

# Konfiguration
COLLECTION_FILE="EVerest-Demo-API.postman_collection.json"
ENVIRONMENT_FILE="${1:-EVerest-Demo-Local.postman_environment.json}"
REPORT_DIR="newman-reports"
ALLURE_RESULTS_DIR="../allure-results-postman"
JUNIT_REPORT_FILE="$REPORT_DIR/newman-junit.xml"

# Erstelle Report-Verzeichnisse
mkdir -p "$REPORT_DIR"
mkdir -p "$ALLURE_RESULTS_DIR"

echo "Starting Newman test execution..."
echo "Collection: $COLLECTION_FILE"
echo "Environment: $ENVIRONMENT_FILE"

# Führe Newman-Tests mit JUnit-Reporter aus (für CI-Systeme)
newman run "$COLLECTION_FILE" \
    -e "$ENVIRONMENT_FILE" \
    --reporters cli,junit,json,allure \
    --reporter-json-export "$REPORT_DIR/newman-report.json" \
    --reporter-junit-export "$JUNIT_REPORT_FILE" \
    --reporter-allure-export "$ALLURE_RESULTS_DIR" \
    --timeout-request 30000 \
    --delay-request 500 \
    --bail \
    --verbose

EXIT_CODE=$?

# Generiere Test-Zusammenfassung
if [ -f "$REPORT_DIR/newman-report.json" ]; then
    echo "Generating test summary..."
    node << 'EOF'
    const fs = require('fs');
    const report = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
    const stats = report.run.stats;
    console.log('\n=== Test Summary ===');
    console.log(`Total Requests: ${stats.requests.total}`);
    console.log(`Passed: ${stats.assertions.total - stats.assertions.failed}`);
    console.log(`Failed: ${stats.assertions.failed}`);
    console.log(`Total Assertions: ${stats.assertions.total}`);
    console.log(`Total Time: ${stats.run.timings.completed - stats.run.timings.started}ms`);
EOF
    "$REPORT_DIR/newman-report.json"
fi

exit $EXIT_CODE
