// UI names: board = pipeline, column = stage, card = deal.

export const LABEL_COLORS = ['violet', 'blue', 'green', 'amber', 'red', 'gray'] as const;
export type LabelColor = (typeof LABEL_COLORS)[number];

export const CURRENCIES = ['USD', 'EUR', 'UAH', 'GBP', 'PLN'] as const;
export type Currency = (typeof CURRENCIES)[number];

export function isCurrency(value: unknown): value is Currency {
  return CURRENCIES.includes(value as Currency);
}

export const STAGE_KINDS = ['open', 'won', 'lost'] as const;
export type StageKind = (typeof STAGE_KINDS)[number];

export interface Label {
  id: string;
  name: string;
  color: LabelColor;
}

export interface StageEvent {
  columnId: string;
  columnTitle: string;
  at: string;
}

export interface Card {
  id: string;
  title: string;
  client: string;
  contact: string;
  value: number | null;
  description: string;
  labelIds: string[];
  dueDate: string | null; // yyyy-mm-dd
  createdAt: string;
  stageEnteredAt: string;
  history: StageEvent[];
}

export interface Column {
  id: string;
  title: string;
  kind: StageKind;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  currency: Currency;
  columns: Column[];
  labels: Label[];
  createdAt: string;
}

export type CardChanges = Partial<
  Pick<Card, 'title' | 'client' | 'contact' | 'value' | 'description' | 'labelIds' | 'dueDate'>
>;
