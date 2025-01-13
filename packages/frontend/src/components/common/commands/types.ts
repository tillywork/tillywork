export type Command = {
  id: string;
  section: string;
  icon: string;
  title: string;
  description?: string;
  action: () => void;
  shortcut?: string[];
  condition?: () => boolean;
};
