import { readFile } from 'node:fs/promises';
import path from 'node:path';

const assetRoot = path.resolve(process.cwd(), 'assets');

function mimeType(filePath: string) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.gif':
      return 'image/gif';
    case '.avif':
      return 'image/avif';
    default:
      return 'application/octet-stream';
  }
}

export async function GET(_: Request, { params }: { params: Promise<{ file: string[] }> }) {
  try {
    const { file } = await params;
    const resolved = path.resolve(assetRoot, ...file);

    if (!resolved.startsWith(assetRoot)) {
      return new Response('Invalid path', { status: 400 });
    }

    const bytes = await readFile(resolved);

    return new Response(bytes, {
      status: 200,
      headers: {
        'Content-Type': mimeType(resolved),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
