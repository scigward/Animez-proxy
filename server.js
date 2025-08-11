import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/play-stream", async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).json({ error: "Missing url parameter" });

  try {
    const response = await fetch(target, {
      headers: {
        "Referer": req.query.referer || "",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    // Forward headers so the player knows it's an m3u8
    res.setHeader("Content-Type", response.headers.get("content-type") || "application/vnd.apple.mpegurl");
    res.setHeader("Access-Control-Allow-Origin", "*");

    response.body.pipe(res);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy failed" });
  }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
