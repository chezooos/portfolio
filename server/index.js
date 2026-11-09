const express = require("express");
const cors = require("cors");
const { pool } = require("./db");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// POST /guestbook — 이름·메시지를 JSON으로 받아 저장
app.post("/guestbook", async (req, res) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";

    if (!name || !message) {
      return res.status(400).json({ error: "name과 message는 필수입니다." });
    }

    const [result] = await pool.execute(
      "INSERT INTO guestbook (name, message) VALUES (?, ?)",
      [name, message]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      message,
    });
  } catch (error) {
    console.error("POST /guestbook error:", error);
    res.status(500).json({ error: "방명록 저장에 실패했습니다." });
  }
});

// GET /guestbook/list — 전체 데이터를 JSON으로 반환
app.get("/guestbook/list", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, name, message, created_at FROM guestbook ORDER BY id DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("GET /guestbook/list error:", error);
    res.status(500).json({ error: "방명록 목록을 불러오지 못했습니다." });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Guestbook server running at http://192.168.50.2:${PORT}`);
});
