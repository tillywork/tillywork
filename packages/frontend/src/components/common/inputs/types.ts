export enum InlineInputTypes {
  TEXT = 'text',
  ARRAY = 'array',
}

export type DateRangeSuggestion = {
  title: string;
  value: string[];
};

/**
 * Suggestions for date ranges.
 * Used to set query value and operator
 * when looking for specific data, or
 * selecting a dynamic date range.
 */
export const DATE_RANGE_SUGGESTIONS: DateRangeSuggestion[] = [
  {
    title: 'Today',
    value: [':startOfDay', ':endOfDay'],
  },
  {
    title: 'Tomorrow',
    value: [':startOfTomorrow', ':endOfTomorrow'],
  },
  {
    title: 'Yesterday',
    value: [':startOfYesterday', ':endOfYesterday'],
  },
  {
    title: 'Today and earlier',
    value: [':startOfTime', ':endOfDay'],
  },
  {
    title: 'Later than today',
    value: [':endOfDay', ':endOfTime'],
  },
  {
    title: 'This week',
    value: [':startOfWeek', ':endOfWeek'],
  },
  {
    title: 'Next week',
    value: [':startOfNextWeek', ':endOfNextWeek'],
  },
  {
    title: 'Last week',
    value: [':startOfLastWeek', ':endOfLastWeek'],
  },
  {
    title: 'This month',
    value: [':startOfMonth', ':endOfMonth'],
  },
  {
    title: 'Next month',
    value: [':startOfNextMonth', ':endOfNextMonth'],
  },
  {
    title: 'Last month',
    value: [':startOfLastMonth', ':endOfLastMonth'],
  },
  {
    title: 'This year',
    value: [':startOfYear', ':endOfYear'],
  },
  {
    title: 'Next year',
    value: [':startOfNextYear', ':endOfNextYear'],
  },
  {
    title: 'Last year',
    value: [':startOfLastYear', ':endOfLastYear'],
  },
  {
    title: 'Overdue',
    value: [':startOfTime', ':startOfDay'],
  },
];
