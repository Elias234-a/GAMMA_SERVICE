/// <reference types="vite/client" />

// This helps TypeScript understand the @/ path alias
declare module '@/pages/*' {
  import type { ComponentType } from 'react';
  const component: ComponentType;
  export default component;
}
