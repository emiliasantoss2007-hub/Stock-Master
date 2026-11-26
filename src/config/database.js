
require('dotenv').config();
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

const dbHost = process.env.DB_HOST;

const config = {
    host: dbHost,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT)
};

// Exige TLS quando a conexão não é local.
if (dbHost !== 'localhost' && dbHost !== '127.0.0.1') {
    config.ssl = {
        ca: fs.readFileSync(
            path.join(__dirname, '../../certs/azure-ca-bundle.pem'),
            'utf8'
        ),
        rejectUnauthorized: true
    };
}

const connection = mysql.createConnection(config);

connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err.message);
        return;
    }

    console.log('Conectado ao MySQL com sucesso!');
});

module.exports = connection;
