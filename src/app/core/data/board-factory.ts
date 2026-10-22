import { Board, Card, Column, Label } from '../models/board.model';
import { createId } from '../utils/id';

export function createLabels(): Label[] {
  return [
    { id: createId(), name: 'Feature', color: 'blue' },
    { id: createId(), name: 'Design', color: 'violet' },
    { id: createId(), name: 'Bug', color: 'red' },
    { id: createId(), name: 'Testing', color: 'green' },
    { id: createId(), name: 'Docs', color: 'amber' },
  ];
}

export function createColumn(title: string, cards: Card[] = []): Column {
  return { id: createId(), title, cards };
}

export function createCard(title: string, extra: Partial<Omit<Card, 'id' | 'title'>> = {}): Card {
  return {
    id: createId(),
    title,
    description: '',
    labelIds: [],
    dueDate: null,
    createdAt: new Date().toISOString(),
    ...extra,
  };
}

export function createBoard(title: string): Board {
  return {
    id: createId(),
    title,
    columns: [createColumn('To do'), createColumn('In progress'), createColumn('Done')],
    labels: createLabels(),
    createdAt: new Date().toISOString(),
  };
}
