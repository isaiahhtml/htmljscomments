import express from "express";
import fs from "node:fs";
import path from "node:path";

const app = express();
const PORT = 3333;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const commentsFilePath = path.join(import.meta.dirname, 'comments.txt');

app.post('/comment', (req, res) => {
  console.log(req.body);
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

    res.status(200).json({ message: 'Comment saved successfully!' });
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
