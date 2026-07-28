import { NextRequest, NextResponse } from 'next/server';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { AssetGroup } from '@/lib/studio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Repo root (apps/web -> ../..), same convention as apps/api/src/upload-products.ts */
const REPO_ROOT = path.resolve(process.cwd(), '../..');

/** Only these repo-root folders are browsable/servable from this route. */
const ASSET_DIRS = ['products', 'product-image', 'collection', 'generated'];

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

function safeResolve(rel: string): string | null {
  const resolved = path.resolve(REPO_ROOT, rel);
  const allowed = ASSET_DIRS.some((d) => resolved.startsWith(path.join(REPO_ROOT, d) + path.sep));
  return allowed ? resolved : null;
}

async function walk(dir: string, relBase: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;
    const rel = path.join(relBase, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path.join(dir, entry.name), rel)));
    } else if (MIME[path.extname(entry.name).toLowerCase()]) {
      files.push(rel);
    }
  }
  return files;
}

export async function GET(req: NextRequest) {
  const file = req.nextUrl.searchParams.get('file');

  // ?file=<repo-relative path> streams a single image (used for thumbnails).
  if (file) {
    const resolved = safeResolve(file);
    const mime = MIME[path.extname(file).toLowerCase()];
    if (!resolved || !mime) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
    }
    try {
      const buf = await readFile(resolved);
      return new NextResponse(new Uint8Array(buf), {
        headers: { 'Content-Type': mime, 'Cache-Control': 'no-store' },
      });
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
  }

  // No ?file — list every image available as a reference, grouped by folder.
  const groups: AssetGroup[] = [];
  for (const dir of ASSET_DIRS) {
    try {
      const files = await walk(path.join(REPO_ROOT, dir), dir);
      if (files.length) groups.push({ dir, files: files.sort() });
    } catch {
      // Folder may not exist yet (e.g. generated/ before the first run) — skip.
    }
  }
  return NextResponse.json({ groups });
}
