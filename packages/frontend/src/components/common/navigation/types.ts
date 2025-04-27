import type { RouteLocationRaw } from 'vue-router';

export interface NavigationMenuItem {
  title: string;
  icon?: string;
  route?: RouteLocationRaw;
  activeOnExactMatch?: boolean;
  onClick?: () => unknown;
  appendText?: string;
}
