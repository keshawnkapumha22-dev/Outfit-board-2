module.exports = async (req, res) => {
  try {
    const u = new URL(String(req.query.url || ""));
    if (u.protocol !== "https:" || u.hostname !== "cdn.shopify.com") {
      return res.status(400).send("Not allowed");
    }
    const r = await fetch(u.href, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return res.status(502).send("Image fetch failed");
    const type = r.headers.get("content-type") || "";
    if (!type.startsWith("image/")) return res.status(400).send("Not an image");
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > 6 * 1024 * 1024) return res.status(413).send("Too large");
    res.setHeader("Content-Type", type);
    res.setHeader("Cache-Control", "public, s-maxage=86400, max-age=86400");
    return res.status(200).send(buf);
  } catch (e) {
    return res.status(400).send("Bad request");
  }
};
