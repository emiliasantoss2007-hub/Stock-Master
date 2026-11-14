
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET não configurada no ambiente.');
}

const sessionStore = new MySQLStore({
    host: '127.0.0.1',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    createDatabaseTable: true,
    expiration: 86400000,
    clearExpired: true,
    checkExpirationInterval: 900000,

    connectionLimit: 10
});

const sessionConfig = session({
    key: 'stockmaster.sid',
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 86400000
    }
});

module.exports = sessionConfig;
