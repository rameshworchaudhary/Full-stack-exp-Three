const mysql = require("mysql2/promise");

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: "127.0.0.1",
      user: "root",
      password: "Ishwor143@#$",
      database: "auth_system",
    });

    console.log("✅ Connected Successfully");
    await connection.end();
  } catch (err) {
    console.error(err);
  }
}

test();