import type { DIALOGS } from '../dialogs/types';

export type Command = {
  section: string;
  icon: string;
  title: string;
  description?: string;
  dialog?: {
    kind: DIALOGS;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any;
  };
  shortcut?: string[];
  // TODO: Support plain actions.
};
