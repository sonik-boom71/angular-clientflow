import { parseDate } from './dates';

export type DueStatus = 'none' | 'overdue' | 'today' | 'soon' | 'later';

const DAY_MS = 24 * 60 * 60 * 1000;
const SOON_DAYS = 2;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDueStatus(dueDate: string | null, today: Date = new Date()): DueStatus {
  if (!dueDate) {
    return 'none';
  }
  const due = parseDate(dueDate);
  if (!due) {
    return 'none';
  }
  const days = Math.round((due.getTime() - startOfDay(today).getTime()) / DAY_MS);
  if (days < 0) {
    return 'overdue';
  }
  if (days === 0) {
    return 'today';
  }
  return days <= SOON_DAYS ? 'soon' : 'later';
}
