import { testBoard, testCard } from '../../../testing/memory-storage';
import { summarizeBoard } from './board-stats';

describe('summarizeBoard', () => {
  const today = new Date(2026, 9, 22);

  it('counts cards and treats the last column as done', () => {
    const summary = summarizeBoard(testBoard(), today);
    expect(summary).toMatchObject({ columnCount: 2, cardCount: 4, doneCount: 1, progress: 25 });
  });

  it('counts overdue cards outside the done column only', () => {
    const board = testBoard();
    board.columns[0].cards.push(testCard('late', { dueDate: '2026-10-01' }));
    board.columns[1].cards.push(testCard('late-but-done', { dueDate: '2026-10-01' }));
    expect(summarizeBoard(board, today).overdueCount).toBe(1);
  });

  it('reports zero progress for an empty board', () => {
    const board = { ...testBoard(), columns: [] };
    expect(summarizeBoard(board, today)).toMatchObject({ cardCount: 0, progress: 0 });
  });
});
