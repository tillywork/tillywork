export type SortOption = {
  key: string;
  order: SortDirection;
};

export type SortDirection = 'ASC' | 'DESC';

export type SortState = SortOption[];
