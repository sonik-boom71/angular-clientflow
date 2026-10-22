export const LABEL_COLORS = ['violet', 'blue', 'green', 'amber', 'red', 'gray'] as const;

export type LabelColor = (typeof LABEL_COLORS)[number];

export interface Label {
  id: string;
  name: string;
  color: LabelColor;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  labelIds: string[];
  /** ISO date (yyyy-mm-dd) or null when the card has no deadline. */
  dueDate: string | null;
  createdAt: string;
}

export interface Column {
  id: string;
  title: string;
  cards: Card[];
}

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  labels: Label[];
  createdAt: string;
}

export type CardChanges = Partial<Pick<Card, 'title' | 'description' | 'labelIds' | 'dueDate'>>;
