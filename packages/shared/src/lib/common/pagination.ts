import { SortState } from './sorting';

export interface PaginationParams {
  page?: number;
  itemsPerPage?: number;
  sort?: SortState;
}
