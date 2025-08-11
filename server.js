import express from "express";
import fetch from "node-fetch";

const app = express();

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  const referer = req.query.referer || "";

  if (!targetUrl) {
    return res.status(400).send("Missing url parameter");
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        Referer: referer,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0",
      },
    });

    res.set("Content-Type", response.headers.get("content-type") || "application/octet-stream");
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send(`Proxy error: ${err.message}`);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
