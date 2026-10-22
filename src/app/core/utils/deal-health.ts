import { Card, StageKind } from '../models/board.model';
import { DueStatus, getDueStatus } from './due-status';

/** An open deal with no deadline that hasn't changed stage for this long needs a follow-up. */
export const FOLLOW_UP_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export function idleDays(card: Card, today: Date = new Date()): number {
  const entered = new Date(card.stageEnteredAt).getTime();
  return Number.isNaN(entered) ? 0 : Math.max(0, Math.floor((today.getTime() - entered) / DAY_MS));
}

export interface DealHealth {
  /** Deadline status; always "none" for closed (won or lost) deals. */
  due: DueStatus;
  /** Days since the last stage change, set only when a follow-up is due. */
  idleDays: number | null;
}

/**
 * Overdue and "needs a follow-up" only apply to open deals. A deal with a future
 * deadline is planned, so it never counts as idle.
 */
export function getDealHealth(card: Card, kind: StageKind, today: Date = new Date()): DealHealth {
  if (kind !== 'open') {
    return { due: 'none', idleDays: null };
  }
  const days = idleDays(card, today);
  return {
    due: getDueStatus(card.dueDate, today),
    idleDays: !card.dueDate && days >= FOLLOW_UP_DAYS ? days : null,
  };
}
