export type Command = {
  section: string;
  icon: string;
  title: string;
  description?: string;
  action: () => void;
  shortcut?: string[];
};
