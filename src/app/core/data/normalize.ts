import {
  Board,
  CURRENCIES,
  Card,
  Column,
  Currency,
  LABEL_COLORS,
  Label,
  LabelColor,
  STAGE_KINDS,
  StageEvent,
  StageKind,
} from '../models/board.model';

type UnknownRecord = Record<string, unknown>;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const EPOCH = new Date(0).toISOString();

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;
const notNull = <T>(value: T | null): value is T => value !== null;

/**
 * Turns anything read from storage or an imported file into valid boards.
 * Missing fields get defaults, so data saved by older versions (TaskFlow v1) keeps working.
 * Returns null when the input isn't a list of boards at all.
 */
export function normalizeBoards(input: unknown): Board[] | null {
  const list = Array.isArray(input)
    ? input
    : isRecord(input) && Array.isArray(input['boards'])
      ? input['boards']
      : null;
  return list ? list.map(normalizeBoard).filter(notNull) : null;
}

function normalizeBoard(input: unknown): Board | null {
  if (!isRecord(input) || typeof input['id'] !== 'string' || !Array.isArray(input['columns'])) {
    return null;
  }
  const currency = CURRENCIES.includes(input['currency'] as Currency)
    ? (input['currency'] as Currency)
    : 'USD';
  const labels = Array.isArray(input['labels']) ? input['labels'] : [];
  return {
    id: input['id'],
    title: text(input['title']).trim() || 'Untitled',
    currency,
    labels: labels.map(normalizeLabel).filter(notNull),
    columns: input['columns'].map(normalizeColumn).filter(notNull),
    createdAt: text(input['createdAt'], EPOCH),
  };
}

function normalizeLabel(input: unknown): Label | null {
  if (!isRecord(input) || typeof input['id'] !== 'string') {
    return null;
  }
  const color = LABEL_COLORS.includes(input['color'] as LabelColor)
    ? (input['color'] as LabelColor)
    : 'gray';
  return { id: input['id'], name: text(input['name']), color };
}

function normalizeColumn(input: unknown): Column | null {
  if (!isRecord(input) || typeof input['id'] !== 'string') {
    return null;
  }
  const kind = STAGE_KINDS.includes(input['kind'] as StageKind)
    ? (input['kind'] as StageKind)
    : 'open';
  const title = text(input['title']).trim() || 'Untitled';
  const cards = Array.isArray(input['cards']) ? input['cards'] : [];
  return {
    id: input['id'],
    title,
    kind,
    cards: cards.map((card) => normalizeCard(card, input['id'] as string, title)).filter(notNull),
  };
}

function normalizeCard(input: unknown, columnId: string, columnTitle: string): Card | null {
  if (!isRecord(input) || typeof input['id'] !== 'string') {
    return null;
  }
  const createdAt = text(input['createdAt'], EPOCH);
  const value =
    typeof input['value'] === 'number' && Number.isFinite(input['value']) && input['value'] >= 0
      ? input['value']
      : null;
  const dueDate =
    typeof input['dueDate'] === 'string' && DATE_ONLY.test(input['dueDate'])
      ? input['dueDate']
      : null;
  const labelIds = Array.isArray(input['labelIds'])
    ? input['labelIds'].filter((id): id is string => typeof id === 'string')
    : [];
  const history = Array.isArray(input['history'])
    ? input['history'].map(normalizeEvent).filter(notNull)
    : [];

  return {
    id: input['id'],
    title: text(input['title']).trim() || 'Untitled',
    client: text(input['client']),
    contact: text(input['contact']),
    value,
    description: text(input['description']),
    labelIds,
    dueDate,
    createdAt,
    stageEnteredAt: text(input['stageEnteredAt'], createdAt),
    history: history.length ? history : [{ columnId, columnTitle, at: createdAt }],
  };
}

function normalizeEvent(input: unknown): StageEvent | null {
  if (!isRecord(input) || typeof input['columnId'] !== 'string') {
    return null;
  }
  return {
    columnId: input['columnId'],
    columnTitle: text(input['columnTitle']),
    at: text(input['at'], EPOCH),
  };
}
