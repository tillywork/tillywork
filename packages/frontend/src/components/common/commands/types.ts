export type Command = {
  id: number;
  section: string;
  icon: string;
  title: string;
  description?: string;
  action: () => void;
  shortcut?: string[];
};

export type CommandDto = Omit<Command, 'id'>;
