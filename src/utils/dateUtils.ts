import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.tz.setDefault("Asia/Kuala_Lumpur"); // Ensure KL timezone

export function getTodayStr(): string {
  return dayjs().format('YYYY-MM-DD');
}

export function getTomorrowStr(): string {
  return dayjs().add(1, 'day').format('YYYY-MM-DD');
}

export function formatDateDisplay(dateStr: string): string {
  return dayjs(dateStr).format('dddd, D MMMM YYYY');
}

export function isPastDate(dateStr: string): boolean {
  return dayjs(dateStr).isBefore(dayjs(), 'day');
}

export { dayjs };
