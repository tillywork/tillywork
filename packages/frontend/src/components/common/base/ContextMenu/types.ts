export type ContextMenuItem = {
  title: string;
  action?: () => void;
  icon?: string;
  color?: string;
  shortcut?: string[];
  photo?: string;
  avatar?: boolean;
  value?: unknown;
};
