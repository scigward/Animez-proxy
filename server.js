export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0";

<<<<<<< HEAD
  if (url.pathname === "/" && request.method === "GET") {
    return new Response("Server is running!", {
      headers: { "Content-Type": "text/plain" },
    });
=======
const app = express();

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.get("/getStream", async (req, res) => {
  const episodeUrl = req.query.url;
  if (!episodeUrl) {
    return res.status(400).send("Missing url parameter");
  }

  try {
    // 1. Fetch episode page
    const pageRes = await fetch(episodeUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0",
        Referer: "https://animeyy.com/",
      },
    });
    const pageHtml = await pageRes.text();

    // 2. Find iframe
    const iframeMatch = pageHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (!iframeMatch) {
      return res.json({ stream: null });
    }
    const embedUrl = new URL(iframeMatch[1].trim(), episodeUrl).href;

    // 3. Fetch embed page
    const embedRes = await fetch(embedUrl, {
      headers: {
        Referer: "https://animeyy.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0",
      },
    });
    const embedHtml = await embedRes.text();

    // 4. Find m3u8 link
    const srcMatch = embedHtml.match(/<source[^>]+src=["']([^"']+\.m3u8)["']/i);
    if (!srcMatch) {
      return res.json({ stream: null });
    }
    const streamUrl = new URL(srcMatch[1].trim(), embedUrl).href;

    // 5. Return proxied stream link
    const proxyUrl = `${req.protocol}://${req.get("host")}/proxy?url=${encodeURIComponent(
      streamUrl
    )}&referer=${encodeURIComponent(embedUrl)}`;

    res.json({ stream: proxyUrl });
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
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
>>>>>>> parent of ace7119 (Update server.js)
  }

<<<<<<< HEAD
  if (url.pathname === "/getStream" && request.method === "GET") {
    const episodeUrl = url.searchParams.get("url");
    if (!episodeUrl) return new Response(JSON.stringify({ streams: [] }), { status: 400 });

    try {
      const pageResp = await fetch(episodeUrl, {
        headers: { Referer: "https://animeyy.com/", "User-Agent": UA },
      });
      const pageHtml = await pageResp.text();

      const iframeMatch = pageHtml.match(/<iframe[^>]+src=["']([^"']+)["']/i);
      if (!iframeMatch) return new Response(JSON.stringify({ streams: [] }));

      const embedUrl = new URL(iframeMatch[1].trim(), episodeUrl).href;

      const embedResp = await fetch(embedUrl, {
        headers: { Referer: "https://animeyy.com/", "User-Agent": UA },
      });
      const embedHtml = await embedResp.text();

      const srcMatch = embedHtml.match(
        /<source[^>]+src=["']([^"']+\.m3u8)["']/i
      );
      if (!srcMatch) return new Response(JSON.stringify({ streams: [] }));

      const StreamUrl = new URL(srcMatch[1].trim(), embedUrl).href;

      return new Response(
        JSON.stringify({
          streams: [
            {
              streamUrl: StreamUrl,
              headers: { Referer: embedUrl },
            },
          ],
          subtitles: null,
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      console.error("getStream error:", err);
      return new Response(JSON.stringify({ streams: [] }), { status: 500 });
    }
  }

  return new Response("Not Found", { status: 404 });
}
=======
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
>>>>>>> parent of ace7119 (Update server.js)
