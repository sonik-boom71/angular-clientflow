import { Card } from '../models/board.model';

export interface CardFilter {
  query: string;
  labelIds: readonly string[];
}

export const EMPTY_FILTER: CardFilter = { query: '', labelIds: [] };

export function isFilterActive(filter: CardFilter): boolean {
  return filter.query.trim().length > 0 || filter.labelIds.length > 0;
}

/**
 * A card matches when its title or description contains the query (case-insensitive)
 * and it carries every selected label.
 */
export function matchesFilter(card: Card, filter: CardFilter): boolean {
  const query = filter.query.trim().toLowerCase();
  if (query) {
    const text = `${card.title} ${card.description}`.toLowerCase();
    if (!text.includes(query)) {
      return false;
    }
  }
  return filter.labelIds.every((id) => card.labelIds.includes(id));
}
