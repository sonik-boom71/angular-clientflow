// The Kanban core is generic (board → column → card). In the UI a board is a
// "pipeline", a column is a "stage" and a card is a "deal".

export const LABEL_COLORS = ['violet', 'blue', 'green', 'amber', 'red', 'gray'] as const;
export type LabelColor = (typeof LABEL_COLORS)[number];

export const CURRENCIES = ['USD', 'EUR', 'UAH', 'GBP', 'PLN'] as const;
export type Currency = (typeof CURRENCIES)[number];

/** Open stages hold work in progress; won and lost stages close a deal. */
export const STAGE_KINDS = ['open', 'won', 'lost'] as const;
export type StageKind = (typeof STAGE_KINDS)[number];

export interface Label {
  id: string;
  name: string;
  color: LabelColor;
}

/** One entry in a deal's activity log. The title is copied so renamed stages still read well. */
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
  /** Deal amount in the board currency, or null when not agreed yet. */
  value: number | null;
  description: string;
  labelIds: string[];
  /** ISO date (yyyy-mm-dd) or null when the deal has no deadline. */
  dueDate: string | null;
  createdAt: string;
  /** When the deal entered its current stage; used to spot deals that stopped moving. */
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
