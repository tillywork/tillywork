import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isYesterday from 'dayjs/plugin/isYesterday';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(relativeTime);
dayjs.extend(isYesterday);
dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);
dayjs.extend(isLeapYear);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

declare module 'dayjs' {
  interface Dayjs {
    formatShort(): string;
  }
}

dayjs.prototype.formatShort = function (): string {
  const now = dayjs();
  const diffInSeconds = now.diff(this, 'second');

  // Less than a minute
  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  }

  // Less than an hour
  const diffInMinutes = now.diff(this, 'minute');
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m`;
  }

  // Less than a day
  const diffInHours = now.diff(this, 'hour');
  if (diffInHours < 24) {
    return `${diffInHours}h`;
  }

  // Less than a month
  const diffInDays = now.diff(this, 'day');
  if (diffInDays < 30) {
    return `${diffInDays}d`;
  }

  // Less than a year
  const diffInMonths = now.diff(this, 'month');
  if (diffInMonths < 12) {
    return `${diffInMonths}mo`;
  }

  // Year or more
  const diffInYears = now.diff(this, 'year');
  return `${diffInYears}y`;
};

export default dayjs;
