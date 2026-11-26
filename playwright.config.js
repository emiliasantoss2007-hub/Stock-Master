const path = require('node:path');
const { defineConfig } = require('@playwright/test');
require('dotenv').config({ path: path.join(__dirname, '.env.e2e') });

const bancoEsperado = 'stockmaster_test';
if (process.env.E2E_EXPECTED_DB !== bancoEsperado || process.env.DB_NAME !== bancoEsperado) {
    throw new Error(
        'Playwright bloqueado: configure .env.e2e com E2E_EXPECTED_DB=stockmaster_test e DB_NAME=stockmaster_test.'
    );
}

module.exports = defineConfig({
    testDir: './tests/e2e',
    testMatch: '**/*.e2e.js',
    fullyParallel: false,
    retries: 0,
    reporter: 'list',
    use: {
        baseURL: 'http://localhost:3001',
        browserName: 'chromium',
        headless: true
    },
    webServer: {
        command: 'node scripts/e2e/start-server.js',
        url: 'http://localhost:3001/html/login.html',
        reuseExistingServer: false,
        timeout: 30_000
    }
});
