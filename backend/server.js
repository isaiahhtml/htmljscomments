import express from "express";
import cors from 'cors';
import fs from "node:fs";
import path from "node:path";

const app = express();
const PORT = 3333;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



const commentsFilePath = path.join(import.meta.dirname, 'comments.txt');

app.post('/comment', (req, res) => {
  const { name, email, comment } = req.body;

  if (!name || !email || !comment) {
    return res.status(400).json({ message: 'All fields are required: name, email, and comment.' });
  }

  const commentData = JSON.stringify({ name, email, comment, timestamp: new Date().toISOString() }) + '\n';

  fs.appendFile(commentsFilePath, commentData, (err) => {
    if (err) {
      console.error('Error writing to file:', err);
      return res.status(500).json({ message: 'Failed to save the comment.' });
    }

    res.redirect('http://localhost:8080')
  });
});

app.get('/comments', (req, res) => {
  let comments;
  try {
    const fileContent = fs.readFileSync(commentsFilePath, "utf8");

    comments = fileContent
      .split("\n")
      .filter(line => line.trim() !== "")
      .map(line => JSON.parse(line));
  } catch (error) {
    console.error("Error reading or parsing comments.txt:", error);
  }
  res.json(comments);
})


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
