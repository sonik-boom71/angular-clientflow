import { Card } from '../models/board.model';

export interface CardFilter {
  query: string;
  labelIds: readonly string[];
}

export const EMPTY_FILTER: CardFilter = { query: '', labelIds: [] };

export function isFilterActive(filter: CardFilter): boolean {
  return filter.query.trim().length > 0 || filter.labelIds.length > 0;
}

export function matchesFilter(card: Card, filter: CardFilter): boolean {
  const query = filter.query.trim().toLowerCase();
  if (query) {
    const text = [card.title, card.client, card.contact, card.description].join(' ').toLowerCase();
    if (!text.includes(query)) {
      return false;
    }
  }
  return filter.labelIds.every((id) => card.labelIds.includes(id));
}
