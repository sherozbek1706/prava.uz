const knex = require('knex');
const knexConfig = require('./knexfile');

const db = knex(knexConfig);

// Test database connection on startup
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ PostgreSQL database connected successfully.');
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err.message);
  });

module.exports = db;
