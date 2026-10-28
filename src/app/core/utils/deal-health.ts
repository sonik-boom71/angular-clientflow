import { Card, StageKind } from '../models/board.model';
import { DueStatus, getDueStatus } from './due-status';

const FOLLOW_UP_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

export function idleDays(card: Card, today: Date = new Date()): number {
  const entered = new Date(card.stageEnteredAt).getTime();
  return Number.isNaN(entered) ? 0 : Math.max(0, Math.floor((today.getTime() - entered) / DAY_MS));
}

export interface DealHealth {
  due: DueStatus;
  idleDays: number | null;
}

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
