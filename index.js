const express = require("express");
const { getRecallList, extractArticle } = require("./api/controllers/recalls");
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

//Routes
app.post("/api/article", async (req, res) => {
  const { url } = req?.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required." });
  }

  try {
    const article = await extractArticle(url);
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.get("/api/recalls", async (req, res) => {
  try {
    const recalls = await getRecallList();
    res.json(recalls);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
