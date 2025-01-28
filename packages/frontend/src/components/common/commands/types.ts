import type { Field } from '@tillywork/shared';
import type { ContextMenuItem } from '../base/ContextMenu/types';

export type Command = Omit<ContextMenuItem, 'action'> & {
  id: string;
  section: string;
  description?: string;
  keepPaletteOpen?: boolean;
  field?: Field;
  action: (() => void) | ((command: Command) => void);
};
