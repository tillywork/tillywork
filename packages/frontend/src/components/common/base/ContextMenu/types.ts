export type ContextMenuItem = {
  icon: string;
  title: string;
  onClick: () => void;
  shortcut?: string[];
};
