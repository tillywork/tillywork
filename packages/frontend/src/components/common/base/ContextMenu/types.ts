export type ContextMenuItem = {
  icon: string;
  title: string;
  action: () => void;
  shortcut?: string[];
};
