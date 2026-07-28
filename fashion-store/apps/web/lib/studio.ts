/**
 * Shared types + prompt presets for the local image-generation studio (/studio).
 * The studio is a local-only tool: it calls the OpenAI image API from a Next.js
 * route handler and saves results into the repo-root `generated/` folder.
 */

export type ShotType = 'home-hero' | 'collection-card' | 'product-on-model' | 'product-flat';
export type FaceMode = 'new-person' | 'same-model' | 'none';
export type ImageSize = 'auto' | '1024x1024' | '1536x1024' | '1024x1536';
export type ImageQuality = 'auto' | 'low' | 'medium' | 'high';

export const IMAGE_SIZES: ImageSize[] = ['auto', '1024x1024', '1536x1024', '1024x1536'];
export const IMAGE_QUALITIES: ImageQuality[] = ['auto', 'low', 'medium', 'high'];

/** The OpenAI image-edit endpoint accepts at most 16 input images per request. */
export const MAX_INPUT_IMAGES = 16;

export interface ShotPreset {
  type: ShotType;
  label: string;
  hint: string;
  defaultSize: ImageSize;
  /** Scene/composition part of the prompt; garment-lock and face text are appended. */
  scene: string;
  /** Standalone product shots never use a face. */
  usesFace: boolean;
}

export const GARMENT_LOCK =
  'Keep the garment exactly as shown in the product reference images — same colour, fabric, sheen, fit, collar, buttons, stitching and proportions. Do not redesign or reinterpret it.';

export const FACE_MODE_TEXT: Record<FaceMode, string> = {
  'new-person':
    'Use the face reference images only as loose inspiration; generate a new, distinct person who merely resembles them — not an exact copy.',
  'same-model':
    'Use the person in the face reference images as the exact same model — keep the face, hair and features identical to the reference.',
  none: '',
};

export const SHOT_PRESETS: ShotPreset[] = [
  {
    type: 'home-hero',
    label: 'Home — hero',
    hint: 'Full-bleed editorial hero with headline space',
    defaultSize: '1536x1024',
    usesFace: true,
    scene:
      'Full-bleed editorial campaign hero for a fashion homepage. A model wearing the garment, cinematic composition with generous negative space on one side for a headline, soft directional light, muted warm-grey backdrop, quiet-luxury mood, photorealistic, high-end editorial quality. Landscape orientation.',
  },
  {
    type: 'collection-card',
    label: 'Collection — card',
    hint: 'Consistent catalogue grid shot',
    defaultSize: '1024x1536',
    usesFace: true,
    scene:
      'Clean catalogue shot for a collection grid: model in a relaxed three-quarter pose wearing the garment, seamless light-grey studio background, soft even lighting, full torso visible, portrait orientation, consistent editorial e-commerce style.',
  },
  {
    type: 'product-on-model',
    label: 'Product — on model',
    hint: 'PDP shot showing drape & fit on a person',
    defaultSize: '1024x1536',
    usesFace: true,
    scene:
      'Product detail page on-model shot: front-facing model wearing the garment, neutral off-white seamless background, true-to-life colour, sharp fabric detail so the customer can judge drape and fit, portrait orientation, photorealistic e-commerce quality.',
  },
  {
    type: 'product-flat',
    label: 'Product — standalone',
    hint: 'Ghost-mannequin shot, no model',
    defaultSize: '1024x1536',
    usesFace: false,
    scene:
      'Standalone product shot without any model: the garment presented ghost-mannequin style, floating on a clean off-white background with a soft natural shadow, front view, true colour and visible fabric texture, portrait orientation, e-commerce catalogue quality.',
  },
];

export function buildPrompt(preset: ShotPreset, faceMode: FaceMode): string {
  const face = preset.usesFace ? FACE_MODE_TEXT[faceMode] : '';
  return [preset.scene, GARMENT_LOCK, face].filter(Boolean).join('\n\n');
}

export interface GeneratedImage {
  /** Path relative to the repo root, e.g. generated/home-hero/hero-2026-07-26.png */
  file: string;
  b64: string;
}

export interface GenerateResponse {
  images: GeneratedImage[];
  error?: string;
}

export interface AssetGroup {
  dir: string;
  files: string[];
}
