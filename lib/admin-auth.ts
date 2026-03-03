import type { NextRequest } from 'next/server';

function decodeBasicAuthHeader(header: string) {
  if (!header.startsWith('Basic ')) return null;

  const encoded = header.slice(6).trim();
  if (!encoded) return null;

  try {
    const decoded = atob(encoded);
    const separator = decoded.indexOf(':');
    if (separator === -1) return null;

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export function checkAdminCredentials(request: NextRequest) {
  const expectedUser = process.env.ADMIN_BASIC_AUTH_USER;
  const expectedPass = process.env.ADMIN_BASIC_AUTH_PASS;

  if (!expectedUser || !expectedPass) {
    return { ok: false, reason: 'missing_config' as const };
  }

  const authHeader = request.headers.get('authorization') || '';
  const parsed = decodeBasicAuthHeader(authHeader);
  if (!parsed) {
    return { ok: false, reason: 'missing_auth' as const };
  }

  if (parsed.username !== expectedUser || parsed.password !== expectedPass) {
    return { ok: false, reason: 'invalid_auth' as const };
  }

  return { ok: true as const };
}
