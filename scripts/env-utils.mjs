import { readFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();

export async function readEnvFile(relativePath) {
  try {
    return await readFile(path.join(ROOT, relativePath), 'utf8');
  } catch {
    return '';
  }
}

export function parseDotenv(text) {
  const out = {};
  for (const line of text.split(/\r?\n/g)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export async function loadMergedEnv() {
  const [localText, envText] = await Promise.all([readEnvFile('.env.local'), readEnvFile('.env')]);
  return {
    ...parseDotenv(envText),
    ...parseDotenv(localText),
    ...process.env,
  };
}

export function isPlaceholder(value) {
  if (!value) return true;
  const v = String(value).trim();
  if (!v) return true;
  return (
    /^your[_-]/i.test(v) ||
    /^replace-with/i.test(v) ||
    /^GTM-XXXXXXX$/i.test(v) ||
    /github-oauth-app-client-id/i.test(v) ||
    /github-oauth-app-client-secret/i.test(v) ||
    /^sk_test_/i.test(v) ||
    /^pk_test_/i.test(v) ||
    /^secure_password$/i.test(v)
  );
}
