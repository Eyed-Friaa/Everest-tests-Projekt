# EVerest Demo - Cypress E2E Tests

This directory contains end-to-end tests for the EVerest Demo UI using Cypress with Allure reporting.

## Prerequisites

Before running the tests, ensure you have:

1. **Docker Desktop** installed and running
2. **Node.js** (v14 or higher) installed
3. The EVerest Demo application running at `http://localhost:1880/ui/`

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the EVerest Demo (in a separate terminal):
```bash
# Choose one of the demo scripts from the main README
curl https://raw.githubusercontent.com/everest/everest-demo/main/demo-ac.sh | bash
```

3. Wait for the application to be fully loaded (all Docker containers running).

## Running Tests

### Open Cypress Test Runner (Interactive Mode)

```bash
npm run cy:open
```

This opens the Cypress Test Runner GUI where you can:
- Select and run individual tests
- See real-time test execution
- Debug tests interactively

### Run All Tests in Headless Mode

```bash
npm run cy:run
```

Or simply:
```bash
npm test
```

### Run Only UI Tests

```bash
npm run test:ui
```

## Generating Allure Reports

### Generate and Open Allure Report

After running tests, generate the Allure report:
```bash
npm run allure:generate
```

Then open it:
```bash
npm run allure:open
```

### Run Tests and Generate Report (One build)

```bash
npm run test:allure
```

This command will:
1. Run all Cypress tests
2. Generate the Allure report
3. Open it automatically in your browser

### Serve Allure Report (Alternative)

```bash
npm run allure:serve
```

## Test Structure

```
cypress/
├── e2e/
│   └── ui/
│       ├── demo-ui.cy.js              # Basic UI loading and display tests
│       ├── charging-controls.cy.js    # Charging button tests
│       ├── dropdown-and-sliders.cy.js # Dropdown and slider interactions
│       └── ui-accessibility.cy.js     # Accessibility and reliability tests
├── support/
│   ├── e2e.js                         # Global test configuration
│   └── commands.js                    # Custom Cypress commands
└── README.md                          # This file
```

## Custom Commands

The following custom commands are available in the tests:

- `cy.waitForAppReady()` - Waits for the application to fully load
- `cy.clickChargingButton(buttonText)` - Clicks a charging button by text
- `cy.verifyUIElement(elementText)` - Verifies a UI element is visible
- `cy.selectFromDropdown(dropdownLabel, option)` - Selects an option from a dropdown
- `cy.setSliderValue(sliderLabel, value)` - Sets a slider to a specific value

## Writing New Tests

When writing new tests:

1. Use the Allure plugin for better reporting:
```javascript
cy.allure()
  .tag('your-tag')
  .description('Test description')
  .testId('unique-test-id')
```

2. Follow the existing test structure
3. Use semantic selectors when possible
4. Add appropriate waits for dynamic content
5. Take screenshots for debugging

## Configuration

Test configuration is in `cypress.config.js`:
- Base URL: `http://localhost:1880`
- Default timeout: 10 seconds
- Video recording: Enabled
- Screenshots on failure: Enabled

## Troubleshooting

### Tests fail with "Cannot connect to localhost:1880"

Ensure the EVerest Demo is running:
```bash
docker ps
```

You should see containers for `mqtt-server`, `manager`, and `node-red`.

### Allure report is empty

Make sure you run tests with Allure enabled (default):
```bash
npm run cy:run
```

Then generate the report:
```bash
npm run allure:generate
```

### Tests are flaky

- Increase timeout values in `cypress.config.js`
- Add explicit waits for dynamic content
- Use `cy.waitForAppReady()` command before tests

## CI/CD Integration

These tests can be integrated into CI/CD pipelines. The Docker-based EVerest Demo makes it easy to run tests in containers:

```bash
# In CI pipeline
npm install
npm run cy:run
npm run allure:generate
# Upload allure-report to artifact storage
```

## Contributing

When adding new tests:
1. Follow existing test patterns
2. Use descriptive test names
3. Add appropriate Allure tags and descriptions
4. Update this README if needed

 дети
