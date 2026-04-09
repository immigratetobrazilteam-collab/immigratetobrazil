#!/usr/bin/env node
import http from "http";
import { spawn } from "child_process";

const PORT = Number.parseInt(process.env.PORT || "4000", 10);
const HOST = process.env.HOST || "127.0.0.1";
const WEBHOOK_TOKEN = process.env.SITEMAP_WEBHOOK_TOKEN || "";
const PUBLIC_HOSTS = new Set(["0.0.0.0", "::"]);
let activeRefresh = null;

if (!Number.isInteger(PORT) || PORT <= 0 || PORT > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`);
}

if (PUBLIC_HOSTS.has(HOST) && !WEBHOOK_TOKEN) {
  throw new Error("SITEMAP_WEBHOOK_TOKEN is required when HOST is exposed beyond localhost.");
}

function isAuthorized(req) {
  if (!WEBHOOK_TOKEN) return true;
  return req.headers["x-webhook-token"] === WEBHOOK_TOKEN;
}

function startRefresh() {
  const child = spawn("npm", ["run", "generate:sitemap"], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  child.on("error", (error) => {
    activeRefresh = null;
    console.error("Sitemap generation failed to start:", error);
  });
  child.on("close", (code) => {
    activeRefresh = null;
    if (code !== 0) {
      console.error("Sitemap generation failed:", stderr.trim() || stdout.trim() || `Exit code ${code}`);
      return;
    }
    console.log("Sitemap generation output:", stdout.trim() || "(no output)");
    if (stderr.trim()) console.log("Sitemap generation warnings:", stderr.trim());
  });

  activeRefresh = child;
}

const server = http.createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/__refresh_sitemap") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Not found\n");
  }

  if (!isAuthorized(req)) {
    res.writeHead(401, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Unauthorized" }));
  }

  if (activeRefresh) {
    res.writeHead(409, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Sitemap refresh already running" }));
  }

  res.writeHead(202, { "Content-Type": "application/json" });
  res.write(JSON.stringify({ status: "started" }));
  res.end();
  startRefresh();
});

server.listen(PORT, HOST, () => {
  console.log(`Sitemap webhook available at http://${HOST}:${PORT}/__refresh_sitemap`);
});
