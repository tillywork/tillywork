export type SortOption = {
  key: string;
  order: SortDirection;
};

export type SortDirection = 'asc' | 'desc';

export type SortState = SortOption[];
