const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'macbookm5air',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'prava_db',
  },
  migrations: {
    directory: path.resolve(__dirname, '../db/migrations'),
  },
  seeds: {
    directory: path.resolve(__dirname, '../db/seeds'),
  },
};
