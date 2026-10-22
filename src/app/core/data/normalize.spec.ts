import { normalizeBoards } from './normalize';

describe('normalizeBoards', () => {
  it('rejects input that is not a list of boards', () => {
    expect(normalizeBoards(null)).toBeNull();
    expect(normalizeBoards('boards')).toBeNull();
    expect(normalizeBoards({ items: [] })).toBeNull();
  });

  it('accepts a plain list or a backup object', () => {
    const board = { id: 'b', title: 'B', columns: [] };
    expect(normalizeBoards([board])).toHaveLength(1);
    expect(normalizeBoards({ app: 'clientflow', boards: [board] })).toHaveLength(1);
  });

  it('fills defaults for data saved by older versions', () => {
    const [board] = normalizeBoards([
      {
        id: 'b',
        title: 'Old',
        createdAt: '2025-01-01T00:00:00.000Z',
        columns: [
          {
            id: 'c',
            title: 'Done',
            cards: [{ id: 'x', title: 'Old card', createdAt: '2025-02-01T00:00:00.000Z' }],
          },
        ],
      },
    ])!;

    expect(board.currency).toBe('USD');
    expect(board.labels).toEqual([]);
    expect(board.columns[0].kind).toBe('open');
    expect(board.columns[0].cards[0]).toEqual({
      id: 'x',
      title: 'Old card',
      client: '',
      contact: '',
      value: null,
      description: '',
      labelIds: [],
      dueDate: null,
      createdAt: '2025-02-01T00:00:00.000Z',
      stageEnteredAt: '2025-02-01T00:00:00.000Z',
      history: [{ columnId: 'c', columnTitle: 'Done', at: '2025-02-01T00:00:00.000Z' }],
    });
  });

  it('drops broken entries and invalid values instead of failing', () => {
    const [board] = normalizeBoards([
      { id: 1, columns: [] },
      {
        id: 'b',
        title: '   ',
        currency: 'BTC',
        labels: [{ id: 'l', name: 'Hot', color: 'pink' }, 'oops'],
        columns: [
          { id: 'c', title: 'Leads', kind: 'maybe', cards: [{ title: 'no id' }, { id: 'ok' }] },
          null,
        ],
      },
    ])!;

    expect(board).toMatchObject({ title: 'Untitled', currency: 'USD' });
    expect(board.labels).toEqual([{ id: 'l', name: 'Hot', color: 'gray' }]);
    expect(board.columns).toHaveLength(1);
    expect(board.columns[0].kind).toBe('open');
    expect(board.columns[0].cards.map((card) => card.id)).toEqual(['ok']);
  });

  it('sanitizes deal values and dates', () => {
    const [board] = normalizeBoards([
      {
        id: 'b',
        columns: [
          {
            id: 'c',
            cards: [
              { id: '1', value: -5, dueDate: '22.10.2026' },
              { id: '2', value: 1200, dueDate: '2026-10-22', labelIds: ['a', 3] },
            ],
          },
        ],
      },
    ])!;
    const [bad, good] = board.columns[0].cards;
    expect(bad).toMatchObject({ value: null, dueDate: null });
    expect(good).toMatchObject({ value: 1200, dueDate: '2026-10-22', labelIds: ['a'] });
  });
});
