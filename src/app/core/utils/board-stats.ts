import { Board } from '../models/board.model';
import { getDueStatus } from './due-status';

export interface BoardSummary {
  id: string;
  title: string;
  columnCount: number;
  cardCount: number;
  /** Cards in the last column, which is treated as "done". */
  doneCount: number;
  /** Cards past their deadline that aren't done yet. */
  overdueCount: number;
  /** Share of done cards, 0–100. */
  progress: number;
}

export function summarizeBoard(board: Board, today: Date = new Date()): BoardSummary {
  const lastColumn = board.columns.at(-1);
  const cardCount = board.columns.reduce((sum, column) => sum + column.cards.length, 0);
  const doneCount = lastColumn?.cards.length ?? 0;
  const overdueCount = board.columns
    .filter((column) => column !== lastColumn)
    .flatMap((column) => column.cards)
    .filter((card) => getDueStatus(card.dueDate, today) === 'overdue').length;

  return {
    id: board.id,
    title: board.title,
    columnCount: board.columns.length,
    cardCount,
    doneCount,
    overdueCount,
    progress: cardCount ? Math.round((doneCount / cardCount) * 100) : 0,
  };
}
