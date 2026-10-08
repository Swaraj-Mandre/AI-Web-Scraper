require("dotenv").config({ quiet: true });
const express = require("express");
const cors = require("cors");
const cheerio = require("cheerio");

const app = express();
const PORT = process.env.PORT || 5000;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Summarizer API is running");
});

// grab the readable text from a page
async function scrapePage(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Could not open the page (status ${response.status})`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // remove stuff that is not real content
  $("script, style, noscript, nav, footer, header, iframe, svg, form").remove();

  const title = $("title").text().trim();

  // prefer article or main tag if the page has one
  let root = $("article").first();
  if (!root.length) root = $("main").first();
  if (!root.length) root = $("body");

  const text = root
    .find("h1, h2, h3, p, li")
    .map((i, el) => $(el).text().trim())
    .get()
    .filter((line) => line.length > 0)
    .join("\n");

  // fallback for pages that don't use p tags much
  const finalText = text.length > 200 ? text : root.text().replace(/\s+/g, " ").trim();

  return { title, text: finalText.slice(0, 15000) };
}

async function summarize(title, text) {
  const prompt = `Summarize the following webpage in a short paragraph followed by 3 to 5 key points as a bullet list. Use simple language.

Title: ${title}

Content:
${text}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.log("Gemini error:", data);
    throw new Error("AI service failed to generate a summary");
  }

  return data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary returned.";
}

app.post("/api/summarize", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "Please provide a URL" });
  }

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return res.status(400).json({ error: "URL must start with http or https" });
    }
  } catch {
    return res.status(400).json({ error: "That does not look like a valid URL" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Server is missing the GEMINI_API_KEY" });
  }

  try {
    const page = await scrapePage(url);

    if (page.text.length < 50) {
      return res.status(422).json({ error: "Could not find enough text on that page" });
    }

    const summary = await summarize(page.title, page.text);
    res.json({ title: page.title, summary });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message || "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
