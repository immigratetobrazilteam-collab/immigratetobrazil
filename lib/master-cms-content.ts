import masterCmsFile from '@/content/cms/master-site.json';
import type { Locale } from '@/lib/types';

type JsonObject = Record<string, unknown>;

const masterCms = (masterCmsFile || {}) as JsonObject;

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getValueAtPath(pathSegments: string[]): unknown {
  let current: unknown = masterCms;
  for (const segment of pathSegments) {
    if (!isObject(current)) return undefined;
    current = current[segment];
  }
  return current;
}

export function deepMergeWithFallback<T>(fallback: T, override: unknown): T {
  if (override == null) return fallback;

  if (Array.isArray(fallback)) {
    if (Array.isArray(override) && override.length > 0) {
      return override as T;
    }
    return fallback;
  }

  if (isObject(fallback)) {
    if (!isObject(override)) return fallback;

    const merged: JsonObject = { ...fallback };
    for (const [key, value] of Object.entries(override)) {
      if (key in fallback) {
        merged[key] = deepMergeWithFallback((fallback as JsonObject)[key], value);
      } else {
        merged[key] = value;
      }
    }

    return merged as T;
  }

  return override as T;
}

export function getMasterSection<T>(section: string, fallback: T): T {
  return deepMergeWithFallback(fallback, getValueAtPath([section]));
}

export function getMasterLocaleSection<T>(section: string, locale: Locale, fallback: T): T {
  const englishValue = getValueAtPath([section, 'en']);
  const localizedValue = getValueAtPath([section, locale]);
  const mergedWithEnglish = deepMergeWithFallback(fallback, englishValue);
  return deepMergeWithFallback(mergedWithEnglish, localizedValue);
}

export function getMasterPathWithFallback<T>(pathSegments: string[], fallback: T): T {
  return deepMergeWithFallback(fallback, getValueAtPath(pathSegments));
}

export function getMasterPath(pathSegments: string[]): unknown {
  return getValueAtPath(pathSegments);
}
