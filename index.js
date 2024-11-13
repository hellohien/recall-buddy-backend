const express = require("express");
const app = express();
const PORT = 3000;

const axios = require("axios");
const cheerio = require("cheerio");

async function scrapePetFoodRecalls() {
  try {
    const { data } = await axios.get(
      "https://www.fda.gov/animal-veterinary/safety-health/recalls-withdrawals"
    );
    const $ = cheerio.load(data);
    const recalls = [];

    $("#datatable tbody tr").each((index, element) => {
      const date = $(element).find("td").eq(0).text().trim(); // Date
      const brandName = $(element).find("td").eq(1).text().trim(); // Brand Name(s)
      const productDescription = $(element).find("td").eq(2).text().trim(); // Product Description
      const recallReason = $(element).find("td").eq(3).text().trim(); // Recall Reason Description
      const companyName = $(element).find("td").eq(4).text().trim(); // Company Name
      const link = $(element).find("td").eq(1).find("a").attr("href");
      const fullLink = link ? "https://www.fda.gov" + link : null;

      recalls.push({
        date,
        brandName,
        productDescription,
        recallReason,
        companyName,
        link: fullLink,
      });
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
