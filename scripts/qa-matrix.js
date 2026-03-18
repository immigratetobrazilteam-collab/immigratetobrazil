import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { spawn, spawnSync } from "child_process";
import net from "net";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REPORT_DIR = path.join(ROOT, "reports", "qa-matrix");

const VIEWPORTS = [
  [320, 640],
  [375, 812],
  [390, 844],
  [414, 896],
  [768, 1024],
  [1024, 768],
  [1280, 800],
  [1440, 900],
  [1920, 1080]
];

const ROUTES = [
  "/",
  "/start-consultation/",
  "/about/lawyer/",
  "/brazil/living/",
  "/process/consultation/",
  "/services/visas/",
  "/services/visas/work/",
  "/services/residencies/cplp/",
  "/services/defense/deportation/",
  "/legal/payment/",
  "/legal/search/"
];

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
      const request = fetch(url, { method: "GET" })
        .then((response) => {
          if (response.ok) resolve();
          else if (Date.now() - started > 10000) reject(new Error(`Server returned ${response.status}`));
          else setTimeout(attempt, 150);
        })
        .catch(() => {
          if (Date.now() - started > 10000) reject(new Error("Timed out waiting for local HTTP server"));
          else setTimeout(attempt, 150);
        });
      return request;
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

function countMatches(source, pattern) {
  return (source.match(pattern) || []).length;
}

function hasClass(source, className) {
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`class=["'][^"']*\\b${escaped}\\b[^"']*["']`, "i");
  return pattern.test(source);
}

function pngDimensions(buffer) {
  if (buffer.length < 24 || buffer.readUInt32BE(0) !== 0x89504e47) return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  };
}

function resolveChromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.CHROMIUM_PATH,
    "/snap/bin/chromium",
    "chromium",
    "google-chrome",
    "google-chrome-stable"
  ].filter(Boolean);

  for (const candidate of candidates) {
    const probe = spawnSync(candidate, ["--version"], {
      cwd: ROOT,
      encoding: "utf8",
      shell: false
    });
    if (probe.status === 0) return candidate;
  }

  throw new Error("Chromium or Chrome is required for responsive QA.");
}

function runChromium(chromePath, args, label) {
  const run = spawnSync(chromePath, args, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 50 * 1024 * 1024
  });
  if (run.status !== 0) {
    throw new Error(run.stderr || run.stdout || `Chromium failed while running ${label}`);
  }
  return run.stdout || "";
}

function chromiumArgs(width, height, extraArgs, url) {
  return [
    "--headless",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-sync",
    "--metrics-recording-only",
    "--mute-audio",
    "--hide-scrollbars",
    "--timeout=4000",
    `--window-size=${width},${height}`,
    ...extraArgs,
    url
  ];
}

async function main() {
  await fs.mkdir(REPORT_DIR, { recursive: true });
  const chromePath = resolveChromePath();
  const { server, baseUrl } = await startServer(ROOT);
  const failures = [];
  const report = [];

  try {
    for (const route of ROUTES) {
      const dom = await fetch(`${baseUrl}${route}`).then((response) => response.text());
      const h1Count = countMatches(dom, /<h1\b/gi);
      const ctaPresent = /data-cta-click=["']true["']/i.test(dom);
      const whatsappPresent = /data-whatsapp-click=["']true["']/i.test(dom);
      const heroPresent = hasClass(dom, "hero");
      const navPresent = hasClass(dom, "main-nav");
      const footerPresent = hasClass(dom, "site-footer");

      if (h1Count !== 1) failures.push(`${route} has ${h1Count} H1 elements`);
      if (!ctaPresent && route !== "/legal/search/") failures.push(`${route} is missing a CTA`);
      if (!whatsappPresent && route !== "/legal/search/") failures.push(`${route} is missing a WhatsApp link`);
      if (!heroPresent) failures.push(`${route} is missing hero block`);
      if (!navPresent) failures.push(`${route} is missing nav`);
      if (!footerPresent) failures.push(`${route} is missing footer`);

      for (const [width, height] of VIEWPORTS) {
        const slug = `${slugifyRoute(route)}-${width}x${height}`;
        const screenshotPath = path.join(REPORT_DIR, `${slug}.png`);

        runChromium(
          chromePath,
          chromiumArgs(width, height, [`--screenshot=${screenshotPath}`], `${baseUrl}${route}`),
          `${route} screenshot`
        );

        const screenshot = await fs.readFile(screenshotPath);
        const dimensions = pngDimensions(screenshot);
        if (!dimensions) {
          failures.push(`${route} at ${width}px did not produce a valid PNG screenshot`);
        } else if (dimensions.width !== width) {
          failures.push(`${route} at ${width}px rendered screenshot width ${dimensions.width}`);
        }

        report.push({
          route,
          width,
          height,
          screenshot: path.relative(ROOT, screenshotPath),
          screenshotDimensions: dimensions,
          checks: {
            h1Count,
            ctaPresent,
            whatsappPresent,
            heroPresent,
            navPresent,
            footerPresent
          }
        });
      }
    }
  } finally {
    server.kill("SIGTERM");
  }

  await fs.writeFile(path.join(REPORT_DIR, "report.json"), JSON.stringify(report, null, 2), "utf8");
  if (failures.length) {
    console.error("Responsive QA failed:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`Responsive QA passed for ${ROUTES.length} routes across ${VIEWPORTS.length} viewports.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
