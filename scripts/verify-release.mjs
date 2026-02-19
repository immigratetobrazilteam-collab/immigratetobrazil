#!/usr/bin/env node
import { spawn } from "node:child_process";

const STEPS = [
  { name: "Route index", cmd: "npm", args: ["run", "migrate:routes"] },
  { name: "CMS validation", cmd: "npm", args: ["run", "cms:validate"] },
  { name: "Typecheck", cmd: "npm", args: ["run", "typecheck"] },
  { name: "Lint", cmd: "npm", args: ["run", "lint"] },
  { name: "Tests", cmd: "npm", args: ["run", "test"] },
  { name: "Build", cmd: "npm", args: ["run", "build"] },
  { name: "Performance budget", cmd: "npm", args: ["run", "perf:budget"] },
];

function runStep(step) {
  return new Promise((resolve) => {
    console.log(`\n==> ${step.name}`);
    const child = spawn(step.cmd, step.args, {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: process.env,
    });

    child.on("exit", (code) => {
      resolve({ name: step.name, ok: code === 0, code: code ?? 1 });
    });
  });
}

async function main() {
  const results = [];

  for (const step of STEPS) {
    const result = await runStep(step);
    results.push(result);
    if (!result.ok) break;
  }

  console.log("\nRelease verification summary");
  for (const result of results) {
    console.log(`- ${result.ok ? "PASS" : "FAIL"}: ${result.name}`);
  }

  const failed = results.find((result) => !result.ok);
  if (failed) {
    console.error(`\nRelease verification failed at: ${failed.name}`);
    process.exit(failed.code);
  }

  console.log("\nAll release verification checks passed.");
}

main().catch((error) => {
  console.error("verify:release failed");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
