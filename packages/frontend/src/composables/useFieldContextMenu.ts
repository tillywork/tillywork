import type { ContextMenuItem } from '@/components/common/base/ContextMenu/types';
import type { Field } from '@tillywork/shared';

export const useFieldContextMenu = () => {
  const getFieldMenuItem = (config: {
    field: Field;
    action: () => void;
  }): ContextMenuItem => {
    return {
      title: config.field.name,
      icon: config.field.icon,
      action: config.action,
    };
  };

  return {
    getFieldMenuItem,
  };
};
