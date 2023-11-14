const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  connectionString: `postgresql://postgres:123@localhost:5432/game_review_db`
});
pool.on('connect', () => {
  console.log('Base de Dados conectado com sucesso!');
});
module.exports = {
  query: (text, params) => pool.query(text, params),
};