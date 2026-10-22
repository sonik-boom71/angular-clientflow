import { testCard } from '../../../testing/memory-storage';
import { getDealHealth, idleDays } from './deal-health';

describe('deal health', () => {
  const today = new Date('2026-10-22T12:00:00.000Z');
  const enteredDaysAgo = (days: number) =>
    new Date(today.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  it('counts whole days since the last stage change', () => {
    expect(idleDays(testCard('1', { stageEnteredAt: enteredDaysAgo(3.5) }), today)).toBe(3);
    expect(idleDays(testCard('1', { stageEnteredAt: 'garbage' }), today)).toBe(0);
  });

  it('asks for a follow-up after a week without movement and without a deadline', () => {
    const fresh = testCard('1', { stageEnteredAt: enteredDaysAgo(6) });
    const stuck = testCard('2', { stageEnteredAt: enteredDaysAgo(9) });
    expect(getDealHealth(fresh, 'open', today).idleDays).toBeNull();
    expect(getDealHealth(stuck, 'open', today).idleDays).toBe(9);
  });

  it('treats a deal with a deadline as planned, not idle', () => {
    const planned = testCard('1', { stageEnteredAt: enteredDaysAgo(30), dueDate: '2026-10-30' });
    expect(getDealHealth(planned, 'open', today)).toEqual({ due: 'later', idleDays: null });
  });

  it('ignores deadlines and idle time once a deal is won or lost', () => {
    const late = testCard('1', { stageEnteredAt: enteredDaysAgo(30), dueDate: '2026-01-01' });
    expect(getDealHealth(late, 'open', today).due).toBe('overdue');
    expect(getDealHealth(late, 'won', today)).toEqual({ due: 'none', idleDays: null });
    expect(getDealHealth(late, 'lost', today)).toEqual({ due: 'none', idleDays: null });
  });
});
