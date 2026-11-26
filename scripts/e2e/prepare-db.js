const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env.e2e') });

const bancoEsperado = 'stockmaster_test';
if (process.env.E2E_EXPECTED_DB !== bancoEsperado || process.env.DB_NAME !== bancoEsperado) {
    console.error('Preparo bloqueado: DB_NAME e E2E_EXPECTED_DB devem ser exatamente stockmaster_test.');
    process.exit(1);
}

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const ddl = [
    `CREATE TABLE IF NOT EXISTS nivel_acesso (
        id_nivel_acesso INT AUTO_INCREMENT PRIMARY KEY,
        descricao VARCHAR(50) NOT NULL UNIQUE
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS usuario (
        id_usuario INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        login VARCHAR(50) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        status BOOLEAN NOT NULL DEFAULT TRUE,
        id_nivel_acesso INT NOT NULL,
        FOREIGN KEY (id_nivel_acesso) REFERENCES nivel_acesso(id_nivel_acesso)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS produto (
        id_produto INT AUTO_INCREMENT PRIMARY KEY,
        sku VARCHAR(50) NOT NULL UNIQUE,
        codigo_barras VARCHAR(100),
        nome VARCHAR(100) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        descricao TEXT,
        quantidade_estoque INT NOT NULL DEFAULT 0,
        estoque_minimo INT NOT NULL DEFAULT 0,
        valor DECIMAL(10,2)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS movimentacao (
        id_movimentacao INT AUTO_INCREMENT PRIMARY KEY,
        tipo_movimentacao VARCHAR(50) NOT NULL,
        quantidade INT NOT NULL,
        justificativa VARCHAR(255),
        data_movimentacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        id_produto INT NOT NULL,
        id_usuario INT NOT NULL,
        FOREIGN KEY (id_produto) REFERENCES produto(id_produto),
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS relatorios (
        id_relatorio INT AUTO_INCREMENT PRIMARY KEY,
        data_inicio DATE NOT NULL,
        data_fim DATE NOT NULL,
        data_geracao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        id_usuario INT NOT NULL,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ) ENGINE=InnoDB`,
    `CREATE TABLE IF NOT EXISTS recuperacao_senha (
        id_recuperacao INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(255) NOT NULL,
        data_expiracao DATETIME NOT NULL,
        utilizado BOOLEAN NOT NULL DEFAULT FALSE,
        id_usuario INT NOT NULL,
        FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
    ) ENGINE=InnoDB`
];

async function executar() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        port: Number(process.env.DB_PORT || 3306),
        multipleStatements: false
    });

    try {
        await connection.query('CREATE DATABASE IF NOT EXISTS stockmaster_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        await connection.changeUser({ database: bancoEsperado });

        for (const sql of ddl) await connection.query(sql);
        await connection.execute(
            'INSERT INTO nivel_acesso (id_nivel_acesso, descricao) VALUES (1, ?), (2, ?) ON DUPLICATE KEY UPDATE descricao = VALUES(descricao)',
            ['Administrador', 'Técnico']
        );

        const adminHash = await bcrypt.hash(process.env.E2E_ADMIN_PASSWORD, 10);
        const tecnicoHash = await bcrypt.hash(process.env.E2E_TECH_PASSWORD, 10);
        await connection.execute(
            `INSERT INTO usuario (nome, email, login, senha_hash, status, id_nivel_acesso)
             VALUES (?, ?, ?, ?, TRUE, ?), (?, ?, ?, ?, TRUE, ?)
             ON DUPLICATE KEY UPDATE nome = VALUES(nome), senha_hash = VALUES(senha_hash), status = TRUE, id_nivel_acesso = VALUES(id_nivel_acesso)`,
            [
                'Administrador E2E', 'e2e.admin@example.test', process.env.E2E_ADMIN_LOGIN, adminHash, 1,
                'Técnico E2E', 'e2e.tecnico@example.test', process.env.E2E_TECH_LOGIN, tecnicoHash, 2
            ]
        );

        console.log('Banco stockmaster_test preparado. Apenas tabelas ausentes e as duas contas e2e foram criadas/atualizadas.');
    } finally {
        await connection.end();
    }
}

if (!process.env.E2E_ADMIN_PASSWORD || !process.env.E2E_TECH_PASSWORD) {
    console.error('Preparo bloqueado: faltam as senhas fictícias E2E no arquivo .env.e2e.');
    process.exit(1);
}

executar().catch((erro) => {
    console.error('Falha ao preparar stockmaster_test:', erro.message);
    process.exitCode = 1;
});
