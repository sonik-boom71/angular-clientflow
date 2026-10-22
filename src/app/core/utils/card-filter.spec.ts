import { testCard } from '../../../testing/memory-storage';
import { EMPTY_FILTER, isFilterActive, matchesFilter } from './card-filter';

describe('card filter', () => {
  const card = testCard('1', {
    title: 'Fix login form',
    description: 'Validation message overlaps the button',
    labelIds: ['bug', 'ui'],
  });

  it('matches everything with an empty filter', () => {
    expect(isFilterActive(EMPTY_FILTER)).toBe(false);
    expect(matchesFilter(card, EMPTY_FILTER)).toBe(true);
  });

  it('searches title and description, ignoring case and padding', () => {
    expect(matchesFilter(card, { query: '  LOGIN ', labelIds: [] })).toBe(true);
    expect(matchesFilter(card, { query: 'overlaps', labelIds: [] })).toBe(true);
    expect(matchesFilter(card, { query: 'signup', labelIds: [] })).toBe(false);
  });

  it('requires every selected label', () => {
    expect(matchesFilter(card, { query: '', labelIds: ['bug'] })).toBe(true);
    expect(matchesFilter(card, { query: '', labelIds: ['bug', 'ui'] })).toBe(true);
    expect(matchesFilter(card, { query: '', labelIds: ['bug', 'docs'] })).toBe(false);
  });

  it('treats a whitespace query as no query', () => {
    expect(isFilterActive({ query: '   ', labelIds: [] })).toBe(false);
  });
});
