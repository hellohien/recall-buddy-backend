const express = require("express");
const app = express();
const PORT = 3000;

const axios = require("axios");
const cheerio = require("cheerio");

async function scrapePetFoodRecalls() {
  try {
    // Fetch the page's HTML
    const { data } = await axios.get(
      "https://www.fda.gov/animal-veterinary/safety-health/recalls-withdrawals"
    );
    const $ = cheerio.load(data);
    const recalls = [];

    // Select and extract relevant data
    $(".recall-list-item").each((index, element) => {
      const title = $(element).find("h3").text().trim();
      const date = $(element).find(".date").text().trim();
      const link = "https://www.fda.gov" + $(element).find("a").attr("href");

      recalls.push({ title, date, link });
    });

    return recalls;
  } catch (error) {
    console.error("Error fetching recalls:", error);
    throw error;
  }
}

app.get("/recalls", async (req, res) => {
  try {
    const recalls = await scrapePetFoodRecalls();
    res.json(recalls);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
