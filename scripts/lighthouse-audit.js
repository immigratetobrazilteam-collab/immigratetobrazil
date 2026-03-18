import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { spawn, spawnSync } from "child_process";
import net from "net";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(ROOT, "reports", "lighthouse");
const CHROME_PATH =
  process.env.CHROME_PATH ||
  process.env.CHROMIUM_PATH ||
  "/snap/bin/chromium";

const ROUTES = [
  "/",
  "/start-consultation/",
  "/services/visas/work/",
  "/process/consultation/",
  "/legal/privacy/"
];

const THRESHOLDS = {
  performance: 0.9,
  accessibility: 0.9,
  "best-practices": 0.9,
  seo: 0.9
};

function reservePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;
      server.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
    server.on("error", reject);
  });
}

function waitForServer(url) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const attempt = () => {
      fetch(url, { method: "GET" })
        .then((response) => {
          if (response.ok) resolve();
          else if (Date.now() - started > 10000) reject(new Error(`Server returned ${response.status}`));
          else setTimeout(attempt, 150);
        })
        .catch(() => {
          if (Date.now() - started > 10000) reject(new Error("Timed out waiting for local HTTP server"));
          else setTimeout(attempt, 150);
        });
    };
    attempt();
  });
}

async function startServer(root) {
  const port = await reservePort();
  const server = spawn("python3", ["-m", "http.server", String(port), "--bind", "127.0.0.1"], {
    cwd: root,
    stdio: "ignore"
  });
  const baseUrl = `http://127.0.0.1:${port}`;
  await waitForServer(baseUrl);
  return {
    server,
    baseUrl
  };
}

function slugifyRoute(route) {
  return route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replace(/\//g, "--");
}

async function main() {
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const { server, baseUrl } = await startServer(ROOT);
  const failures = [];
  const summary = [];

  try {
    for (const route of ROUTES) {
      const slug = slugifyRoute(route);
      const reportPath = path.join(REPORT_DIR, `${slug}.json`);
      const url = `${baseUrl}${route}`;
      const run = spawnSync(
        "npx",
        [
          "lighthouse",
          url,
          "--quiet",
          "--preset=desktop",
          "--chrome-path",
          CHROME_PATH,
          "--chrome-flags=--headless=new --no-sandbox",
          "--only-categories=performance,accessibility,best-practices,seo",
          "--output=json",
          `--output-path=${reportPath}`
        ],
        { cwd: ROOT, encoding: "utf8" }
      );
      if (run.status !== 0) {
        throw new Error(run.stderr || run.stdout || `Lighthouse failed for ${route}`);
      }
      const report = JSON.parse(await fs.readFile(reportPath, "utf8"));
      const scores = Object.fromEntries(
        Object.entries(report.categories).map(([key, value]) => [key, value.score])
      );
      summary.push({ route, scores });
      for (const [key, minimum] of Object.entries(THRESHOLDS)) {
        if ((scores[key] ?? 0) < minimum) {
          failures.push(`${route} ${key} score ${scores[key]} below ${minimum}`);
        }
      }
    }
  } finally {
    server.kill("SIGTERM");
  }

  await fs.writeFile(path.join(REPORT_DIR, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
  if (failures.length) {
    console.error("Lighthouse audit failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`Lighthouse thresholds passed for ${ROUTES.length} representative routes.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
