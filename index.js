const express = require("express");
const app = express();
const PORT = 3000;

const axios = require("axios");
const cheerio = require("cheerio");

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

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

async function extractArticle(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const article = [];

    const $ = cheerio.load(html);

    const announcementDate = $(
      "dt:contains('Company Announcement Date:') + dd time"
    ).text();
    const company = $("dt:contains('Company Name:') + dd").text();
    const brandName = $(
      "dt:contains('Brand Name:') + dd div.field--item"
    ).text();
    const productDescription = $(
      "dt:contains('Product Description:') + dd div.field--item"
    ).text();
    const productType = $("dt:contains('Product Type:') + dd")
      .text()
      .trim()
      .replace(/\s+/g, " ");
    const link = url;
    const contactInfo = $("dt:contains('Consumers:') + dd a").attr("href");

    article.push({
      announcementDate,
      company,
      brandName,
      productDescription,
      productType,
      link,
      contactInfo: contactInfo ? contactInfo.replace("mailto:", "") : null,
    });

    return article;
  } catch (error) {
    console.error("Error fetching article:", error);
    throw error;
  }
}

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
    const recalls = await scrapePetFoodRecalls();
    res.json(recalls);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
