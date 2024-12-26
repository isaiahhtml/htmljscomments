import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
const PORT = 3333;
const corsOptions = {
  origin: 'http://127.0.0.1:8080',
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new Database('comments.db', { verbose: console.log });

db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    comment TEXT NOT NULL,
    timestamp_utc DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT CHECK (status IN ('default', 'moderated', 'retracted')) DEFAULT 'default'
  )
`);

app.post('/comment', (req, res) => {
  const { name, email, comment } = req.body;

  if (!name || !email || !comment) {
    return res.status(400).json({ message: 'All fields are required: name, email, and comment.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO comments (name, email, comment, timestamp_utc)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(name, email, comment, new Date().toISOString());
  } catch (error) {
    console.error('Database error:', error);
  }
  res.redirect('http://localhost:8080');
});

app.get('/comments', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM comments');
    const comments = stmt.all();

    res.status(200).json(comments);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Failed to fetch comments.'});
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
