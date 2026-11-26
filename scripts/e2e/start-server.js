const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.e2e') });

if (process.env.E2E_EXPECTED_DB !== 'stockmaster_test' || process.env.DB_NAME !== 'stockmaster_test') {
    console.error('Servidor E2E bloqueado: DB_NAME e E2E_EXPECTED_DB devem ser exatamente stockmaster_test.');
    process.exit(1);
}

process.env.PORT = '3001';
process.env.NODE_ENV = 'test';
require('../../server');
