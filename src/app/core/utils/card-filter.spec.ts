import { testCard } from '../../../testing/memory-storage';
import { EMPTY_FILTER, isFilterActive, matchesFilter } from './card-filter';

describe('card filter', () => {
  const card = testCard('1', {
    title: 'Online store redesign',
    client: 'Kvitka Flowers',
    contact: '@kvitka_shop',
    description: 'Needs a new checkout',
    labelIds: ['design', 'web'],
  });

  it('matches everything with an empty filter', () => {
    expect(isFilterActive(EMPTY_FILTER)).toBe(false);
    expect(matchesFilter(card, EMPTY_FILTER)).toBe(true);
  });

  it('searches project, client, contact and notes, ignoring case and padding', () => {
    for (const query of ['  STORE ', 'kvitka flowers', '@kvitka', 'checkout']) {
      expect(matchesFilter(card, { query, labelIds: [] })).toBe(true);
    }
    expect(matchesFilter(card, { query: 'logo', labelIds: [] })).toBe(false);
  });

  it('requires every selected label', () => {
    expect(matchesFilter(card, { query: '', labelIds: ['design'] })).toBe(true);
    expect(matchesFilter(card, { query: '', labelIds: ['design', 'web'] })).toBe(true);
    expect(matchesFilter(card, { query: '', labelIds: ['design', 'mobile'] })).toBe(false);
  });

  it('treats a whitespace query as no query', () => {
    expect(isFilterActive({ query: '   ', labelIds: [] })).toBe(false);
  });
});
