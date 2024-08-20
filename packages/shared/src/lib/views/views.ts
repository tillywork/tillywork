import { SortOption } from '../common';
import { ListGroupOptions } from '../lists';

export type ViewOptions = {
  groupBy: ViewGroupByOption;
  sortBy: SortOption;
  hideCompleted: boolean;
  hideChildren: boolean;
};

export type ViewGroupByOption = {
  type: ListGroupOptions;
  fieldId?: number;
};
