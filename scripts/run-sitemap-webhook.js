#!/usr/bin/env node
import http from "http";
import { exec } from "child_process";

const PORT = process.env.PORT || 4000;

const server = http.createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/__refresh_sitemap") {
    res.writeHead(404, { "Content-Type": "text/plain" });
    return res.end("Not found\n");
  }

  res.writeHead(202, { "Content-Type": "application/json" });
  res.write(JSON.stringify({ status: "started" }));
  res.end();

  exec("npm run generate:sitemap", { cwd: process.cwd(), env: process.env }, (error, stdout, stderr) => {
    if (error) {
      console.error("Sitemap generation failed:", error);
      return;
    }
    console.log("Sitemap generation output:", stdout.trim());
    if (stderr) console.log("Sitemap generation warnings:", stderr.trim());
  });
});

server.listen(PORT, () => {
  console.log(`Sitemap webhook available at http://localhost:${PORT}/__refresh_sitemap`);
});
