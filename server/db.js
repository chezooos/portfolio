const mysql = require("mysql2/promise");

// MySQL 연결 정보 — 나중에 실제 값으로 채워 주세요.
const dbConfig = {
  host: "127.0.0.1",
  port: 3306,
  user: "guestbook_user",
  password: "1234",
  database: "guestbook_db",
};

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = { pool, dbConfig };
