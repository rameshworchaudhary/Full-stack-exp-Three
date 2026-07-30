require("dotenv").config();

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "auth_system",
  waitForConnections: true,
  connectionLimit: 10,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL Connected Successfully");
    connection.release();
  } catch (err) {
    console.error("❌ Database Connection Failed");
    console.error(err);
  }
})();

module.exports = pool;