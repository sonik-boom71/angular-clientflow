import { testBoard, testCard } from '../../../testing/memory-storage';
import { Board } from '../models/board.model';
import { earningsByMonth, stageTotals, summarizeBoard, topClients } from './board-stats';

describe('board stats', () => {
  const today = new Date(2026, 9, 22, 12);

  // Leads: $500 (overdue) + $300 (idle). Paid: $1,000 + $2,000 + no amount. Lost: $700.
  function pipeline(): Board {
    const board = testBoard();
    board.columns[0].cards = [
      testCard('a', { value: 500, dueDate: '2026-10-01' }),
      testCard('b', { value: 300, stageEnteredAt: '2026-10-01T00:00:00.000Z' }),
    ];
    board.columns[1].cards = [
      testCard('c', { value: 1000, client: 'Brew & Co', stageEnteredAt: '2026-10-05T10:00:00' }),
      testCard('d', { value: 2000, client: ' brew  & co', stageEnteredAt: '2026-08-15T10:00:00' }),
      testCard('e', { value: null, client: 'FitSpace', stageEnteredAt: '2025-01-01T10:00:00' }),
    ];
    board.columns[2].cards = [testCard('f', { value: 700 })];
    return board;
  }

  it('summarizes money, win rate and deals that need attention', () => {
    expect(summarizeBoard(pipeline(), today)).toMatchObject({
      dealCount: 6,
      openCount: 2,
      openValue: 800,
      wonCount: 3,
      wonValue: 3000,
      lostCount: 1,
      winRate: 75,
      averageWonValue: 1000,
      overdueCount: 1,
      idleCount: 1,
    });
  });

  it('has no win rate or average before any deal closes', () => {
    const board = testBoard();
    board.columns[1].cards = [];
    expect(summarizeBoard(board, today)).toMatchObject({ winRate: null, averageWonValue: null });
  });

  it('totals every stage', () => {
    expect(stageTotals(pipeline()).map((s) => [s.title, s.kind, s.count, s.value])).toEqual([
      ['Leads', 'open', 2, 800],
      ['Paid', 'won', 3, 3000],
      ['Lost', 'lost', 1, 700],
    ]);
  });

  it('groups earnings by the month a deal was won, oldest first', () => {
    const months = earningsByMonth(pipeline(), 3, today);
    expect(months.map((m) => [m.month.getMonth(), m.value])).toEqual([
      [7, 2000],
      [8, 0],
      [9, 1000],
    ]);
  });

  it('ranks clients by paid value, merging spelling variants', () => {
    expect(topClients(pipeline())).toEqual([
      { client: 'Brew & Co', value: 3000, count: 2 },
      { client: 'FitSpace', value: 0, count: 1 },
    ]);
  });
});
