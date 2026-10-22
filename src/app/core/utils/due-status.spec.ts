import { getDueStatus } from './due-status';

describe('getDueStatus', () => {
  const today = new Date(2026, 9, 22, 15, 30);

  it.each([
    [null, 'none'],
    ['not a date', 'none'],
    ['2026-10-21', 'overdue'],
    ['2026-10-22', 'today'],
    ['2026-10-23', 'soon'],
    ['2026-10-24', 'soon'],
    ['2026-10-25', 'later'],
    ['2027-01-01', 'later'],
  ] as const)('classifies %s as %s', (dueDate, expected) => {
    expect(getDueStatus(dueDate, today)).toBe(expected);
  });
});
