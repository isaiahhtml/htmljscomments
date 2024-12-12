import express from "express";

const app = express();
const PORT = 3333;

app.post('/comment', (req, res) => {
  console.log(`POST request received`)
})
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
