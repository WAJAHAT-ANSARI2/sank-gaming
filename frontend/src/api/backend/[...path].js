export default async function handler(req, res) {
  const path = req.query.path;

  const query = new URLSearchParams(req.query);
  query.delete("path");

  const url = `https://sankgaming.is-great.net/backend/api/${path.join("/")}${
    query.toString() ? `?${query.toString()}` : ""
  }`;

  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
        ...(req.headers.authorization
          ? { Authorization: req.headers.authorization }
          : {}),
      },
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : JSON.stringify(req.body),
    });

    const text = await response.text();

    res.status(response.status);
    res.setHeader(
      "Content-Type",
      response.headers.get("content-type") || "application/json"
    );

    res.send(text);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Proxy error",
      error: error.message,
    });
  }
}