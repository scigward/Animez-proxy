import express from "express";
import fetch from "node-fetch";

const app = express();
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0";

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/getStream", async (req, res) => {
  const episodeUrl = req.query.url;
  if (!episodeUrl) return res.status(400).json({ streams: [] });

  try {
    const pageResp = await fetch(episodeUrl, {
      headers: { Referer: "https://animeyy.com/", "User-Agent": UA },
    });
    const pageHtml = await pageResp.text();

    const iframeMatch = pageHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (!iframeMatch) return res.json({ streams: [] });
    const embedUrl = new URL(iframeMatch[1].trim(), episodeUrl).href;

    const embedResp = await fetch(embedUrl, {
      headers: { Referer: "https://animeyy.com/", "User-Agent": UA },
    });
    const embedHtml = await embedResp.text();

    const srcMatch = embedHtml.match(
      /<source[^>]+src=["']([^"']+\.m3u8)["']/i
    );
    if (!srcMatch) return res.json({ streams: [] });

    const realStreamUrl = new URL(srcMatch[1].trim(), embedUrl).href;

    return res.json({
      streams: [
        {
          streamUrl: realStreamUrl,
          headers: { Referer: embedUrl },
        },
      ],
      subtitles: null,
    });
  } catch (err) {
    console.error("getStream error:", err);
    return res.status(500).json({ streams: [] });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
