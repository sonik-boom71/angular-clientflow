export type DueStatus = 'none' | 'overdue' | 'today' | 'soon' | 'later';

const DAY_MS = 24 * 60 * 60 * 1000;
const SOON_DAYS = 2;

/** Parses yyyy-mm-dd as a local date, so the result doesn't shift with the time zone. */
function parseLocalDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Classifies a card deadline relative to `today`. */
export function getDueStatus(dueDate: string | null, today: Date = new Date()): DueStatus {
  if (!dueDate) {
    return 'none';
  }
  const due = parseLocalDate(dueDate);
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
