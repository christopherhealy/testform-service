// server.js (ESM version for Render)
import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const FILE = path.join(__dirname, "testform.json");

function readJson() {
  if (!fs.existsSync(FILE)) {
    return { message: "hello vercel" };
  }
  return JSON.parse(fs.readFileSync(FILE, "utf8"));
}

function writeJson(obj) {
  fs.writeFileSync(FILE, JSON.stringify(obj, null, 2), "utf8");
}

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // GET JSON
  if (req.method === "GET" && req.url === "/testform.json") {
    const data = readJson();
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(data));
  }

  // POST JSON
  if (req.method === "POST" && req.url === "/testform.json") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const parsed = JSON.parse(body || "{}");
        const msg = parsed.message || "hello vercel";
        writeJson({ message: msg });
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ ok: true, message: msg }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ ok: false, error: "bad json" }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`✅ Testform service running on port ${PORT}`);
});
