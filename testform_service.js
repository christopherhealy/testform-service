// testform_service.js
// run with:  node testform_service.js
// then open your Vercel page and it will talk to http://localhost:3010

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3010;
const DATA_FILE = path.join(__dirname, "testform.json");

// default data if file missing
const DEFAULT_DATA = { message: "hello vercel" };

// make sure file exists
function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_DATA, null, 2), "utf8");
  }
}

// read current JSON
function readData() {
  ensureDataFile();
  const txt = fs.readFileSync(DATA_FILE, "utf8");
  try {
    return JSON.parse(txt);
  } catch (e) {
    return DEFAULT_DATA;
  }
}

// write JSON
function writeData(obj) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2), "utf8");
}

const server = http.createServer((req, res) => {
  // CORS so Vercel can call us
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  // health
  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ ok: true }));
  }

  // GET current message
  if (req.method === "GET" && req.url === "/testform.json") {
    const data = readData();
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(data));
  }

  // POST new message
  if (req.method === "POST" && req.url === "/testform.json") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const incoming = JSON.parse(body || "{}");
        const msg = typeof incoming.message === "string"
          ? incoming.message
          : DEFAULT_DATA.message;

        writeData({ message: msg });

        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ ok: true, message: msg }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ ok: false, error: "bad_json" }));
      }
    });
    return;
  }

  // fallback
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  ensureDataFile();
  console.log(`✅ testform service running on http://localhost:${PORT}`);
  console.log(`➡ try:  http://localhost:${PORT}/testform.json`);
});