import { NextRequest, NextResponse } from 'next/server';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import {
  IMAGE_QUALITIES,
  IMAGE_SIZES,
  MAX_INPUT_IMAGES,
  type GeneratedImage,
  type ImageQuality,
  type ImageSize,
} from '@/lib/studio';

export const runtime = 'nodejs';
/** gpt-image-1 typically takes 20–60s per request; allow slow multi-image runs. */
export const maxDuration = 300;

const REPO_ROOT = path.resolve(process.cwd(), '../..');
const OUT_DIR = path.join(REPO_ROOT, 'generated');

/** Reference images may only be read from these repo-root folders. */
const ASSET_DIRS = ['products', 'product-image', 'collection', 'generated'];

const MIME: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'shot';

function safeResolve(rel: string): string | null {
  const resolved = path.resolve(REPO_ROOT, rel);
  const allowed = ASSET_DIRS.some((d) => resolved.startsWith(path.join(REPO_ROOT, d) + path.sep));
  return allowed ? resolved : null;
}

async function assetToBlob(rel: string): Promise<{ blob: Blob; name: string } | null> {
  const resolved = safeResolve(rel);
  const mime = MIME[path.extname(rel).toLowerCase()];
  if (!resolved || !mime) return null;
  const buf = await readFile(resolved);
  return { blob: new Blob([new Uint8Array(buf)], { type: mime }), name: path.basename(rel) };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY ?? req.headers.get('x-openai-key') ?? '';
  if (!apiKey) {
    return NextResponse.json(
      { error: 'No OpenAI API key. Set OPENAI_API_KEY in .env or paste one in the key field.' },
      { status: 400 }
    );
  }

  const form = await req.formData();

  const prompt = String(form.get('prompt') ?? '').trim();
  if (!prompt) return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });

  const sizeRaw = String(form.get('size') ?? 'auto');
  const size: ImageSize = (IMAGE_SIZES as string[]).includes(sizeRaw) ? (sizeRaw as ImageSize) : 'auto';
  const qualityRaw = String(form.get('quality') ?? 'auto');
  const quality: ImageQuality = (IMAGE_QUALITIES as string[]).includes(qualityRaw)
    ? (qualityRaw as ImageQuality)
    : 'auto';
  const n = Math.min(4, Math.max(1, Number(form.get('n') ?? 1) || 1));
  const highFidelity = form.get('highFidelity') !== 'false';
  const shotType = slugify(String(form.get('shotType') ?? 'misc'));
  const name = slugify(String(form.get('name') ?? 'shot'));

  // References: files uploaded from the browser + repo-relative paths picked from disk.
  const uploads = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  let assetPaths: string[] = [];
  try {
    assetPaths = JSON.parse(String(form.get('assetPaths') ?? '[]')) as string[];
  } catch {
    return NextResponse.json({ error: 'assetPaths must be a JSON array.' }, { status: 400 });
  }

  const upstream = new FormData();
  upstream.append('model', 'gpt-image-1');
  upstream.append('prompt', prompt);
  upstream.append('n', String(n));
  if (size !== 'auto') upstream.append('size', size);
  if (quality !== 'auto') upstream.append('quality', quality);
  // High input fidelity preserves garment detail and faces much better on edits.
  if (highFidelity) upstream.append('input_fidelity', 'high');

  let count = 0;
  for (const rel of assetPaths) {
    const asset = await assetToBlob(rel);
    if (!asset) {
      return NextResponse.json({ error: `Invalid reference path: ${rel}` }, { status: 400 });
    }
    upstream.append('image[]', asset.blob, asset.name);
    count++;
  }
  for (const file of uploads) {
    upstream.append('image[]', file, file.name);
    count++;
  }
  if (count === 0) {
    return NextResponse.json({ error: 'Add at least one reference image.' }, { status: 400 });
  }
  if (count > MAX_INPUT_IMAGES) {
    return NextResponse.json(
      { error: `Too many reference images (${count}); the API allows ${MAX_INPUT_IMAGES}.` },
      { status: 400 }
    );
  }

  const res = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: upstream,
  });

  const json = (await res.json()) as {
    data?: { b64_json?: string }[];
    error?: { message?: string };
  };
  if (!res.ok) {
    return NextResponse.json(
      { error: json.error?.message ?? `OpenAI request failed (${res.status})` },
      { status: res.status }
    );
  }

  // Save every result locally under generated/<shotType>/ at the repo root.
  const dir = path.join(OUT_DIR, shotType);
  await mkdir(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

  const images: GeneratedImage[] = [];
  for (const [i, item] of (json.data ?? []).entries()) {
    if (!item.b64_json) continue;
    const filename = `${name}-${stamp}-${i + 1}.png`;
    await writeFile(path.join(dir, filename), Buffer.from(item.b64_json, 'base64'));
    images.push({ file: path.join('generated', shotType, filename), b64: item.b64_json });
  }

  if (!images.length) {
    return NextResponse.json({ error: 'OpenAI returned no images.' }, { status: 502 });
  }
  return NextResponse.json({ images });
}
