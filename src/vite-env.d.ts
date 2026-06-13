/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ASR_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}