import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addDays, subDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export const DEFAULT_TIMEZONE = process.env.DEFAULT_TIMEZONE || 'Asia/Kolkata';

/**
 * Returns today's date in YYYY-MM-DD for the given timezone
 */
export function getTodayDateString(timezone: string = DEFAULT_TIMEZONE): string {
  const zonedNow = toZonedTime(new Date(), timezone);
  return format(zonedNow, 'yyyy-MM-dd');
}

/**
 * Validates if string is a valid YYYY-MM-DD date
 */
export function isValidDateString(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const parsed = parseISO(dateStr);
  return !isNaN(parsed.getTime());
}

/**
 * Formats a date object to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Returns array of YYYY-MM-DD strings for a 7-day week ending on the selected date (or starting on Monday)
 */
export function getWeekDateRange(selectedDate: string): { startDate: string; endDate: string; dates: string[] } {
  const parsed = parseISO(selectedDate);
  const start = startOfWeek(parsed, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(parsed, { weekStartsOn: 1 });
  const interval = eachDayOfInterval({ start, end });
  
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
    dates: interval.map(d => format(d, 'yyyy-MM-dd'))
  };
}

/**
 * Returns array of YYYY-MM-DD strings for a month (or for month parameter YYYY-MM)
 */
export function getMonthDateRange(yearMonth: string): { startDate: string; endDate: string; dates: string[] } {
  // yearMonth can be 'YYYY-MM' or 'YYYY-MM-DD'
  const dateStr = yearMonth.length === 7 ? `${yearMonth}-01` : yearMonth;
  const parsed = parseISO(dateStr);
  const start = startOfMonth(parsed);
  const end = endOfMonth(parsed);
  const interval = eachDayOfInterval({ start, end });
  
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
    dates: interval.map(d => format(d, 'yyyy-MM-dd'))
  };
}

/**
 * Returns last N days up to reference date
 */
export function getLastNDays(referenceDate: string, n: number): string[] {
  const parsed = parseISO(referenceDate);
  const dates: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    dates.push(format(subDays(parsed, i), 'yyyy-MM-dd'));
  }
  return dates;
}
