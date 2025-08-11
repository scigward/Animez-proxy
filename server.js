import express from "express";
import fetch from "node-fetch";
import path from "path";
import url from "url";

const app = express();

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  const realReferer = req.query.realReferer || "";

  if (!targetUrl) {
    return res.status(400).send("Missing url parameter");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Referer: realReferer,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0",
      },
    });

    let contentType = response.headers.get("content-type") || "";
    res.set("Content-Type", contentType);

    // If it's an m3u8 playlist, rewrite segment & sub-playlist URLs
    if (contentType.includes("application/vnd.apple.mpegurl") || targetUrl.endsWith(".m3u8")) {
      let playlist = await response.text();

      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);

      playlist = playlist.replace(/^(?!#)(.*)$/gm, (line) => {
        line = line.trim();
        if (!line) return line;

        // Resolve relative URLs
        let absoluteUrl = line;
        if (!/^https?:\/\//i.test(line)) {
          absoluteUrl = new URL(line, baseUrl).href;
        }

        // Route through our proxy
        return `${req.protocol}://${req.get("host")}/proxy?url=${encodeURIComponent(
          absoluteUrl
        )}&realReferer=${encodeURIComponent(realReferer)}`;
      });

      return res.send(playlist);
    }

    // For non-m3u8, just pipe directly
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send(`Proxy error: ${err.message}`);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
