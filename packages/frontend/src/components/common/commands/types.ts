import type { ContextMenuItem } from '../base/ContextMenu/types';

export type Command = ContextMenuItem & {
  id: string;
  section: string;
  description?: string;
};
