import { TestBed } from '@angular/core/testing';

import { MemoryStorage, testBoard } from '../../../testing/memory-storage';
import { DEMO_BOARD_ID } from '../data/demo-boards';
import { Board } from '../models/board.model';
import { BOARDS_STORAGE_KEY, BoardStore, LEGACY_STORAGE_KEY } from './board-store';
import { StorageService } from './storage.service';

describe('BoardStore', () => {
  let storage: MemoryStorage;

  function setup(saved?: Board[], legacy?: unknown): BoardStore {
    storage = new MemoryStorage();
    if (saved) {
      storage.data.set(BOARDS_STORAGE_KEY, saved);
    }
    if (legacy) {
      storage.data.set(LEGACY_STORAGE_KEY, legacy);
    }
    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useValue: storage }],
    });
    return TestBed.inject(BoardStore);
  }

  const cardIds = (store: BoardStore, columnId: string) =>
    store
      .findBoard('b1')
      ?.columns.find((column) => column.id === columnId)
      ?.cards.map((card) => card.id);

  afterEach(() => vi.useRealTimers());

  it('seeds the demo pipeline on the first visit', () => {
    const store = setup();
    const demo = store.findBoard(DEMO_BOARD_ID);
    expect(store.boardCount()).toBe(1);
    expect(demo?.title).toBe('Freelance 2026');
    expect(demo?.columns.map((column) => column.kind)).toEqual([
      'open',
      'open',
      'open',
      'open',
      'won',
      'lost',
    ]);
  });

  it('restores saved pipelines instead of the demo', () => {
    const store = setup([testBoard()]);
    expect(store.boards().map((board) => board.id)).toEqual(['b1']);
  });

  it('migrates TaskFlow v1 boards and swaps the old task demo for the new one', () => {
    const v1Board = {
      id: 'mine',
      title: 'My tasks',
      labels: [],
      createdAt: '2025-01-01T00:00:00.000Z',
      columns: [{ id: 'c', title: 'To do', cards: [{ id: 'x', title: 'Old card' }] }],
    };
    const store = setup(undefined, [{ ...v1Board, id: 'demo' }, v1Board]);

    expect(store.boards().map((board) => board.id)).toEqual([DEMO_BOARD_ID, 'mine']);
    const migrated = store.findBoard('mine')!.columns[0];
    expect(migrated.kind).toBe('open');
    expect(migrated.cards[0]).toMatchObject({ title: 'Old card', client: '', value: null });
  });

  it('creates a pipeline with the six default stages and ignores blank names', () => {
    const store = setup([]);
    expect(store.createBoard('   ')).toBeNull();

    const board = store.createBoard('  Agency work  ');
    expect(board?.title).toBe('Agency work');
    expect(board?.currency).toBe('USD');
    expect(board?.columns.map((column) => column.title)).toEqual([
      'Leads',
      'Proposal sent',
      'In progress',
      'Invoiced',
      'Paid',
      'Lost',
    ]);
  });

  it('brings the demo back when it was deleted', () => {
    const store = setup([testBoard()]);
    expect(store.ensureDemoBoard()).toBe(DEMO_BOARD_ID);
    expect(store.boards().map((board) => board.id)).toEqual([DEMO_BOARD_ID, 'b1']);

    store.ensureDemoBoard();
    expect(store.boardCount()).toBe(2);
  });

  it('renames a pipeline, changes its currency and deletes it', () => {
    const store = setup([testBoard()]);
    store.renameBoard('b1', 'Renamed');
    store.setCurrency('b1', 'UAH');
    expect(store.findBoard('b1')).toMatchObject({ title: 'Renamed', currency: 'UAH' });

    store.deleteBoard('b1');
    expect(store.boards()).toEqual([]);
  });

  it('adds a deal with a "created" history entry, then updates and deletes it', () => {
    const store = setup([testBoard()]);
    const card = store.addCard('b1', 'c1', 'Landing page')!;
    expect(card.history).toEqual([
      expect.objectContaining({ columnId: 'c1', columnTitle: 'Leads' }),
    ]);

    store.updateCard('b1', card.id, { client: 'Brew & Co', value: 900, title: '  Landing  ' });
    expect(store.findBoard('b1')?.columns[0].cards[3]).toMatchObject({
      title: 'Landing',
      client: 'Brew & Co',
      value: 900,
    });

    store.deleteCard('b1', card.id);
    expect(cardIds(store, 'c1')).toEqual(['1', '2', '3']);
  });

  it('keeps the old title when an update sends a blank one', () => {
    const store = setup([testBoard()]);
    store.updateCard('b1', '1', { title: '   ' });
    expect(store.findBoard('b1')?.columns[0].cards[0].title).toBe('Deal 1');
  });

  it('logs a move to another stage and restarts the idle timer', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-22T12:00:00.000Z'));
    const store = setup([testBoard()]);

    store.moveCard('b1', 'c1', 'c2', 1, 0);
    expect(cardIds(store, 'c1')).toEqual(['1', '3']);
    expect(cardIds(store, 'c2')).toEqual(['2', '4']);

    const moved = store.findBoard('b1')!.columns[1].cards[0];
    expect(moved.stageEnteredAt).toBe('2026-10-22T12:00:00.000Z');
    expect(moved.history.at(-1)).toEqual({
      columnId: 'c2',
      columnTitle: 'Paid',
      at: '2026-10-22T12:00:00.000Z',
    });
  });

  it('reorders deals inside a stage without touching their history', () => {
    const store = setup([testBoard()]);
    store.moveCard('b1', 'c1', 'c1', 0, 2);
    expect(cardIds(store, 'c1')).toEqual(['2', '3', '1']);
    expect(store.findBoard('b1')!.columns[0].cards[2].history).toHaveLength(1);
  });

  it('keeps the same state for moves that change nothing', () => {
    const store = setup([testBoard()]);
    const before = store.boards();
    store.moveCard('b1', 'c1', 'c2', 9, 0);
    store.moveCard('b1', 'c1', 'c1', 1, 1);
    store.setColumnKind('b1', 'c2', 'won');
    expect(store.boards()).toBe(before);
  });

  it('adds, renames, retypes, reorders and deletes stages', () => {
    const store = setup([testBoard()]);
    store.addColumn('b1', 'Review');
    store.renameColumn('b1', 'c2', 'Paid in full');
    store.setColumnKind('b1', 'c3', 'open');
    store.moveColumn('b1', 3, 0);
    expect(
      store.findBoard('b1')?.columns.map((column) => `${column.title}:${column.kind}`),
    ).toEqual(['Review:open', 'Leads:open', 'Paid in full:won', 'Lost:open']);

    store.deleteColumn('b1', 'c1');
    expect(store.findBoard('b1')?.columns).toHaveLength(3);
  });

  it('writes every change to storage', () => {
    const store = setup([testBoard()]);
    store.renameBoard('b1', 'Saved');
    TestBed.tick();
    expect(storage.data.get(BOARDS_STORAGE_KEY)).toEqual(store.boards());
  });
});
