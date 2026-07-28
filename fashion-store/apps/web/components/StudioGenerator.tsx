'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildPrompt,
  IMAGE_QUALITIES,
  IMAGE_SIZES,
  MAX_INPUT_IMAGES,
  SHOT_PRESETS,
  type AssetGroup,
  type FaceMode,
  type GeneratedImage,
  type ImageQuality,
  type ImageSize,
  type ShotType,
} from '@/lib/studio';

const assetUrl = (file: string) => `/api/studio/assets?file=${encodeURIComponent(file)}`;

const label = 'text-[11px] uppercase tracking-[0.22em] text-neutral-500';
const input =
  'w-full border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-900 focus:outline-none';

function AssetPicker({
  groups,
  selected,
  onToggle,
}: {
  groups: AssetGroup[];
  selected: string[];
  onToggle: (file: string) => void;
}) {
  if (!groups.length) return <p className="text-sm text-neutral-400">No local images found.</p>;
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.dir}>
          <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-neutral-400">
            {group.dir}/
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {group.files.map((file) => {
              const isSelected = selected.includes(file);
              return (
                <button
                  key={file}
                  type="button"
                  onClick={() => onToggle(file)}
                  title={file}
                  className={`relative aspect-square overflow-hidden border transition ${
                    isSelected
                      ? 'border-neutral-900 ring-1 ring-neutral-900'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- local tool; thumbnails come from a dynamic API route */}
                  <img
                    src={assetUrl(file)}
                    alt={file}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center bg-neutral-900 text-[10px] text-white">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function UploadList({
  files,
  onAdd,
  onRemove,
  id,
}: {
  files: File[];
  onAdd: (files: FileList | null) => void;
  onRemove: (index: number) => void;
  id: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {files.map((file, i) => (
        <span
          key={`${file.name}-${i}`}
          className="flex items-center gap-2 border border-neutral-200 px-2 py-1 text-xs text-neutral-600"
        >
          {file.name}
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="text-neutral-400 hover:text-neutral-900"
            aria-label={`Remove ${file.name}`}
          >
            ×
          </button>
        </span>
      ))}
      <label
        htmlFor={id}
        className="cursor-pointer border border-dashed border-neutral-300 px-3 py-1 text-xs text-neutral-500 hover:border-neutral-500"
      >
        + upload
        <input
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            onAdd(e.target.files);
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );
}

export function StudioGenerator() {
  const [groups, setGroups] = useState<AssetGroup[]>([]);
  const [shotType, setShotType] = useState<ShotType>('product-on-model');
  const [faceMode, setFaceMode] = useState<FaceMode>('new-person');
  const [prompt, setPrompt] = useState(() =>
    buildPrompt(SHOT_PRESETS.find((p) => p.type === 'product-on-model')!, 'new-person')
  );
  const [productAssets, setProductAssets] = useState<string[]>([]);
  const [faceAssets, setFaceAssets] = useState<string[]>([]);
  const [productFiles, setProductFiles] = useState<File[]>([]);
  const [faceFiles, setFaceFiles] = useState<File[]>([]);
  const [size, setSize] = useState<ImageSize>('1024x1536');
  const [quality, setQuality] = useState<ImageQuality>('auto');
  const [highFidelity, setHighFidelity] = useState(true);
  const [n, setN] = useState(1);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const preset = useMemo(() => SHOT_PRESETS.find((p) => p.type === shotType)!, [shotType]);

  const loadAssets = useCallback(async () => {
    try {
      const res = await fetch('/api/studio/assets');
      const json = (await res.json()) as { groups?: AssetGroup[] };
      setGroups(json.groups ?? []);
    } catch {
      setGroups([]);
    }
  }, []);

  useEffect(() => {
    void loadAssets();
    return () => abortRef.current?.abort();
  }, [loadAssets]);

  function applyPreset(type: ShotType, mode: FaceMode) {
    const next = SHOT_PRESETS.find((p) => p.type === type)!;
    setShotType(type);
    setFaceMode(mode);
    setSize(next.defaultSize);
    setPrompt(buildPrompt(next, mode));
  }

  const toggle = (list: string[], set: (v: string[]) => void) => (file: string) =>
    set(list.includes(file) ? list.filter((f) => f !== file) : [...list, file]);

  const addFiles = (set: React.Dispatch<React.SetStateAction<File[]>>) => (files: FileList | null) =>
    files && set((prev) => [...prev, ...Array.from(files)]);

  const totalRefs =
    productAssets.length + faceAssets.length + productFiles.length + faceFiles.length;

  async function generate() {
    if (loading) return;
    setError(null);
    if (!totalRefs) {
      setError('Add at least one product reference image.');
      return;
    }
    if (totalRefs > MAX_INPUT_IMAGES) {
      setError(`Too many reference images (${totalRefs}); the API allows ${MAX_INPUT_IMAGES}.`);
      return;
    }
    setLoading(true);

    const form = new FormData();
    form.append('prompt', prompt);
    form.append('shotType', shotType);
    form.append('name', name || preset.type);
    form.append('size', size);
    form.append('quality', quality);
    form.append('highFidelity', String(highFidelity));
    form.append('n', String(n));
    // Product refs go first so "the product images" reads naturally in the prompt.
    form.append('assetPaths', JSON.stringify([...productAssets, ...faceAssets]));
    for (const file of [...productFiles, ...faceFiles]) form.append('files', file);

    abortRef.current = new AbortController();
    try {
      const res = await fetch('/api/studio/generate', {
        method: 'POST',
        body: form,
        headers: apiKey ? { 'x-openai-key': apiKey } : undefined,
        signal: abortRef.current.signal,
      });
      const json = (await res.json()) as { images?: GeneratedImage[]; error?: string };
      if (!res.ok || !json.images) {
        setError(json.error ?? 'Generation failed.');
      } else {
        setResults((prev) => [...json.images!, ...prev]);
        void loadAssets(); // new files appear in the pickers (e.g. reuse a generated face)
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setError('Request failed — is the dev server still running?');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-12 px-6 pb-24">
      {/* 01 — Shot type */}
      <section>
        <p className={label}>01 — Shot type</p>
        <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {SHOT_PRESETS.map((p) => (
            <button
              key={p.type}
              type="button"
              onClick={() => applyPreset(p.type, p.usesFace ? faceMode : 'none')}
              className={`border p-4 text-left transition ${
                shotType === p.type
                  ? 'border-neutral-900'
                  : 'border-neutral-200 hover:border-neutral-400'
              }`}
            >
              <span className="block text-sm">{p.label}</span>
              <span className="mt-1 block text-xs text-neutral-400">{p.hint}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 02 — Product references */}
      <section className="space-y-4">
        <p className={label}>02 — Product references ({productAssets.length + productFiles.length})</p>
        <AssetPicker
          groups={groups}
          selected={productAssets}
          onToggle={toggle(productAssets, setProductAssets)}
        />
        <UploadList
          id="product-upload"
          files={productFiles}
          onAdd={addFiles(setProductFiles)}
          onRemove={(i) => setProductFiles((prev) => prev.filter((_, idx) => idx !== i))}
        />
      </section>

      {/* 03 — Face references */}
      {preset.usesFace && (
        <section className="space-y-4">
          <p className={label}>03 — Face references ({faceAssets.length + faceFiles.length})</p>
          <div className="flex gap-2">
            {(
              [
                ['new-person', 'New person (resembles refs)'],
                ['same-model', 'Exact same model'],
                ['none', 'No face reference'],
              ] as [FaceMode, string][]
            ).map(([mode, text]) => (
              <button
                key={mode}
                type="button"
                onClick={() => applyPreset(shotType, mode)}
                className={`border px-3 py-1.5 text-xs transition ${
                  faceMode === mode
                    ? 'border-neutral-900 bg-neutral-900 text-white'
                    : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
                }`}
              >
                {text}
              </button>
            ))}
          </div>
          {faceMode !== 'none' && (
            <>
              <AssetPicker
                groups={groups}
                selected={faceAssets}
                onToggle={toggle(faceAssets, setFaceAssets)}
              />
              <UploadList
                id="face-upload"
                files={faceFiles}
                onAdd={addFiles(setFaceFiles)}
                onRemove={(i) => setFaceFiles((prev) => prev.filter((_, idx) => idx !== i))}
              />
              <p className="text-xs text-neutral-400">
                Tip: generate once with “new person”, then select that result from generated/ and
                switch to “exact same model” to keep one model across the whole catalogue.
              </p>
            </>
          )}
        </section>
      )}

      {/* 04 — Prompt */}
      <section>
        <p className={label}>04 — Prompt</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          className={`mt-3 ${input} font-mono text-xs leading-relaxed`}
        />
      </section>

      {/* 05 — Options */}
      <section>
        <p className={label}>05 — Options</p>
        <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <p className="mb-1 text-xs text-neutral-400">Size</p>
            <select value={size} onChange={(e) => setSize(e.target.value as ImageSize)} className={input}>
              {IMAGE_SIZES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-1 text-xs text-neutral-400">Quality</p>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as ImageQuality)}
              className={input}
            >
              {IMAGE_QUALITIES.map((q) => (
                <option key={q}>{q}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="mb-1 text-xs text-neutral-400">Variations</p>
            <select value={n} onChange={(e) => setN(Number(e.target.value))} className={input}>
              {[1, 2, 3, 4].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="mb-1 text-xs text-neutral-400">File name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={preset.type}
              className={input}
            />
          </div>
          <div className="col-span-2">
            <p className="mb-1 text-xs text-neutral-400">OpenAI key (blank = use .env)</p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-…"
              className={input}
            />
          </div>
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
          <input
            type="checkbox"
            checked={highFidelity}
            onChange={(e) => setHighFidelity(e.target.checked)}
          />
          High input fidelity (better garment & face preservation)
        </label>
      </section>

      {/* Generate */}
      <section className="space-y-4">
        <button
          type="button"
          onClick={() => void generate()}
          disabled={loading}
          className="w-full border border-neutral-900 bg-neutral-900 py-4 text-[12px] uppercase tracking-[0.22em] text-white transition hover:bg-white hover:text-neutral-900 disabled:cursor-wait disabled:opacity-50"
        >
          {loading ? 'Generating — 20 to 60s…' : `Generate ${n > 1 ? `${n} images` : 'image'}`}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      {/* Results */}
      {results.length > 0 && (
        <section>
          <p className={label}>Results — saved to generated/ at repo root</p>
          <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {results.map((img) => (
              <figure key={img.file} className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- data URI result preview */}
                <img
                  src={`data:image/png;base64,${img.b64}`}
                  alt={img.file}
                  className="w-full border border-neutral-200"
                />
                <figcaption className="flex items-center justify-between gap-2 text-xs text-neutral-500">
                  <span className="truncate" title={img.file}>
                    {img.file}
                  </span>
                  <a
                    href={`data:image/png;base64,${img.b64}`}
                    download={img.file.split('/').pop()}
                    className="shrink-0 underline hover:text-neutral-900"
                  >
                    download
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
