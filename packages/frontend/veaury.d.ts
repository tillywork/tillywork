declare module 'veaury/vite' {
  import type { Plugin } from 'vite';

  interface VeauryViteOptions {
    type: string;
  }

  function veauryVite(options?: VeauryViteOptions): Plugin;
  export default veauryVite;
}

declare module 'veaury' {
  import type { Component } from 'vue';
  import type { ComponentType } from 'react';

  export function applyReactInVue<P = any>(
    Component: ComponentType<P>,
    options?: {
      useForward?: boolean;
    }
  ): Component;

  export function applyPureReactInVue<P = any>(
    Component: ComponentType<P>,
    options?: {
      useForward?: boolean;
    }
  ): Component;

  export function applyVueInReact(
    Component: Component,
    options?: {
      useForward?: boolean;
    }
  ): ComponentType<any>;
}
