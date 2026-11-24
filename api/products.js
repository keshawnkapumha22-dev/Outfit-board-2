function isBlockedHost(h) {
  return (
    h === "localhost" ||
    h.endsWith(".local") ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(h) ||
    h.includes(":")
  );
}

async function getJson(url) {
  const r = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; OutfitBoard/0.1)", Accept: "application/json" },
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) return null;
  try {
    return await r.json();
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
  let input = String(req.query.url || "").trim();
  if (!input) return res.status(400).json({ error: "Paste a store link first." });
  if (!/^https?:\/\//i.test(input)) input = "https://" + input;

  let origin;
  try {
    const u = new URL(input);
    if (isBlockedHost(u.hostname)) throw new Error("blocked");
    origin = u.origin;
  } catch {
    return res.status(400).json({ error: "That doesn't look like a store link." });
  }

  try {
    let data =
      (await getJson(origin + "/collections/best-sellers/products.json?limit=250")) ||
      (await getJson(origin + "/collections/best-selling/products.json?limit=250"));
    if (!data || !data.products || !data.products.length) {
      data = await getJson(origin + "/products.json?limit=250");
    }
    if (!data || !Array.isArray(data.products) || !data.products.length) {
      return res.status(404).json({
        error: "Couldn't read products from this store. Right now only Shopify stores work.",
      });
    }
    const products = data.products
      .filter((p) => p.images && p.images.length)
      .map((p) => ({
        title: p.title,
        type: p.product_type || "",
        tags: Array.isArray(p.tags) ? p.tags.join(" ") : String(p.tags || ""),
        price: p.variants && p.variants[0] ? p.variants[0].price : "",
        image: p.images[0].src,
        link: origin + "/products/" + p.handle,
      }));
    return res.status(200).json({ store: new URL(origin).hostname.replace(/^www\./, ""), products });
  } catch (e) {
    return res.status(502).json({ error: "The store didn't respond. Try again in a moment." });
  }
};
