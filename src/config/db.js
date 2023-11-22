const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
  connectionString: `postgres://aqtuzzwb:yqtOcjwCQ9phNUXpoNTYXcj8w3bA3lNm@isabelle.db.elephantsql.com/aqtuzzwb`
});
pool.on('connect', () => {
  console.log('Base de Dados conectado com sucesso!');
});
module.exports = {
  query: (text, params) => pool.query(text, params),
};