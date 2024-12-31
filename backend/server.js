import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
const PORT = 3333;
const corsOptions = {
  origin: 'http://127.0.0.1:8080',
  optionsSuccessStatus: 200
}

app.use(cors());
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

app.get('/comments/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare("SELECT * FROM comments WHERE id = ?");
    const result = stmt.get(id);

    res.status(200).json(result);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Failed to fetch comment.'});
  }
})

app.patch('/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const stmt = db.prepare("UPDATE comments SET status = ? WHERE id = ?");
    const result = stmt.run(status, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({ message: "Record update successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
