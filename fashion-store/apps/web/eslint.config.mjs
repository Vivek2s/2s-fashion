import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  { ignores: ['.next/**', 'next-env.d.ts', 'public/**'] },
  ...compat.config({ extends: ['next/core-web-vitals', 'next/typescript'] }),
];

export default config;
