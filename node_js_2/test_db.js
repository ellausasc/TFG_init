// test_db.js
const { Pool } = require('pg');
require('dotenv').config();

// Extraemos los datos de tu URL del .env para probar la conexión manual
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkConnection() {
  console.log("Intentando conectar a:", process.env.DATABASE_URL);
  
  try {
    const client = await pool.connect();
    console.log("CONEXIÓN EXITOSA");
    
    const res = await client.query('SELECT current_user, current_database(), version()');
    console.table(res.rows);
    
    client.release();
    process.exit(0);
  } catch (err) {
    console.error("ERROR DE CONEXIÓN:");
    console.error("Mensaje:", err.message);
    console.error("Código de error:", err.code);
    process.exit(1);
  }
}

checkConnection();