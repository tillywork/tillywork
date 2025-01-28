import type { ColumnDef } from '@tanstack/vue-table';
import type { Field, FieldTypes } from '@tillywork/shared';

export type TableColumnDef = ColumnDef<any, any> & {
  cellType: FieldTypes | 'actions' | 'title';
  field?: Field;
};
