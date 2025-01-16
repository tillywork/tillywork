export type PaletteFieldItem = {
  id: string | null;
  value: any;
  label: string;
  icon?: string;
  photo?: string;
  color?: string;
  isUser?: boolean;
  onClick: ((item: PaletteFieldItem) => void) | (() => void);
};
