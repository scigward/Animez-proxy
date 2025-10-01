export async function onRequest(context) {
  const request = context.request;
  const url = new URL(request.url);
  const UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0";

  if (url.pathname === "/" && request.method === "GET") {
    return new Response("Server is running!", {
      headers: { "Content-Type": "text/plain" },
    });
  }

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
