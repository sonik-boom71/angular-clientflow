import { Board, Currency, StageKind } from '../models/board.model';
import { getDealHealth } from './deal-health';

export interface BoardSummary {
  id: string;
  title: string;
  currency: Currency;
  dealCount: number;
  openCount: number;
  openValue: number;
  wonCount: number;
  wonValue: number;
  lostCount: number;
  /** Share of closed deals that were won, 0–100, or null before anything closes. */
  winRate: number | null;
  averageWonValue: number | null;
  overdueCount: number;
  idleCount: number;
}

const sumValues = (cards: { value: number | null }[]) =>
  cards.reduce((sum, card) => sum + (card.value ?? 0), 0);

export function summarizeBoard(board: Board, today: Date = new Date()): BoardSummary {
  const byKind = (kind: StageKind) =>
    board.columns.filter((column) => column.kind === kind).flatMap((column) => column.cards);
  const open = byKind('open');
  const won = byKind('won');
  const lost = byKind('lost');
  const closed = won.length + lost.length;
  const health = open.map((card) => getDealHealth(card, 'open', today));

  return {
    id: board.id,
    title: board.title,
    currency: board.currency,
    dealCount: open.length + closed,
    openCount: open.length,
    openValue: sumValues(open),
    wonCount: won.length,
    wonValue: sumValues(won),
    lostCount: lost.length,
    winRate: closed ? Math.round((won.length / closed) * 100) : null,
    averageWonValue: won.length ? Math.round(sumValues(won) / won.length) : null,
    overdueCount: health.filter((h) => h.due === 'overdue').length,
    idleCount: health.filter((h) => h.idleDays !== null).length,
  };
}

export interface StageTotal {
  columnId: string;
  title: string;
  kind: StageKind;
  count: number;
  value: number;
}

export function stageTotals(board: Board): StageTotal[] {
  return board.columns.map((column) => ({
    columnId: column.id,
    title: column.title,
    kind: column.kind,
    count: column.cards.length,
    value: sumValues(column.cards),
  }));
}

export interface MonthTotal {
  /** First day of the month, local time. */
  month: Date;
  value: number;
}

/** Won deals grouped by the month they reached a won stage, oldest first. */
export function earningsByMonth(board: Board, months = 6, today: Date = new Date()): MonthTotal[] {
  const totals = Array.from({ length: months }, (_, index) => ({
    month: new Date(today.getFullYear(), today.getMonth() - (months - 1 - index), 1),
    value: 0,
  }));
  const won = board.columns.filter((c) => c.kind === 'won').flatMap((c) => c.cards);
  for (const card of won) {
    const date = new Date(card.stageEnteredAt);
    const slot = totals.find(
      (total) =>
        total.month.getFullYear() === date.getFullYear() &&
        total.month.getMonth() === date.getMonth(),
    );
    if (slot) {
      slot.value += card.value ?? 0;
    }
  }
  return totals;
}

export interface ClientTotal {
  client: string;
  value: number;
  count: number;
}

/** Clients ranked by paid value. Names are matched ignoring case and extra spaces. */
export function topClients(board: Board, limit = 5): ClientTotal[] {
  const totals = new Map<string, ClientTotal>();
  for (const card of board.columns.filter((c) => c.kind === 'won').flatMap((c) => c.cards)) {
    const name = card.client.trim().replace(/\s+/g, ' ');
    if (!name) {
      continue;
    }
    const key = name.toLowerCase();
    const total = totals.get(key) ?? { client: name, value: 0, count: 0 };
    total.value += card.value ?? 0;
    total.count += 1;
    totals.set(key, total);
  }
  return [...totals.values()].sort((a, b) => b.value - a.value).slice(0, limit);
}
