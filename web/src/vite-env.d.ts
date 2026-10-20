/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly [key: string]: unknown;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
