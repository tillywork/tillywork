import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import isToday from 'dayjs/plugin/isToday';
import utc from 'dayjs/plugin/utc';

export const useDate = () => {
  dayjs.extend(relativeTime);
  dayjs.extend(isToday);
  dayjs.extend(utc);

  return {
    dayjs,
  };
};
