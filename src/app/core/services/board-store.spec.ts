import { TestBed } from '@angular/core/testing';

import { MemoryStorage, testBoard } from '../../../testing/memory-storage';
import { DEMO_BOARD_ID } from '../data/demo-boards';
import { Board } from '../models/board.model';
import { BOARDS_STORAGE_KEY, BoardStore } from './board-store';
import { StorageService } from './storage.service';

describe('BoardStore', () => {
  let storage: MemoryStorage;

  function setup(saved?: Board[]): BoardStore {
    storage = new MemoryStorage();
    if (saved) {
      storage.data.set(BOARDS_STORAGE_KEY, saved);
    }
    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useValue: storage }],
    });
    return TestBed.inject(BoardStore);
  }

  const cardTitles = (store: BoardStore, columnId: string) =>
    store
      .findBoard('b1')
      ?.columns.find((column) => column.id === columnId)
      ?.cards.map((card) => card.id);

  it('seeds the demo boards on the first visit', () => {
    const store = setup();
    expect(store.boardCount()).toBe(2);
    expect(store.findBoard(DEMO_BOARD_ID)?.title).toBe('Portfolio launch');
  });

  it('restores saved boards instead of the demo', () => {
    const store = setup([testBoard()]);
    expect(store.boards().map((board) => board.id)).toEqual(['b1']);
  });

  it('creates a board with three default columns and ignores blank names', () => {
    const store = setup([]);
    expect(store.createBoard('   ')).toBeNull();

    const board = store.createBoard('  Side project  ');
    expect(board?.title).toBe('Side project');
    expect(board?.columns.map((column) => column.title)).toEqual(['To do', 'In progress', 'Done']);
    expect(store.boardCount()).toBe(1);
  });

  it('renames and deletes a board', () => {
    const store = setup([testBoard()]);
    store.renameBoard('b1', 'Renamed');
    expect(store.findBoard('b1')?.title).toBe('Renamed');

    store.deleteBoard('b1');
    expect(store.boards()).toEqual([]);
  });

  it('adds, updates and deletes a card', () => {
    const store = setup([testBoard()]);
    const card = store.addCard('b1', 'c2', 'Ship it');
    expect(cardTitles(store, 'c2')).toEqual(['4', card?.id]);

    store.updateCard('b1', card!.id, { title: '  Ship v1  ', dueDate: '2026-12-31' });
    const updated = store.findBoard('b1')?.columns[1].cards[1];
    expect(updated?.title).toBe('Ship v1');
    expect(updated?.dueDate).toBe('2026-12-31');

    store.deleteCard('b1', card!.id);
    expect(cardTitles(store, 'c2')).toEqual(['4']);
  });

  it('keeps the old title when an update sends a blank one', () => {
    const store = setup([testBoard()]);
    store.updateCard('b1', '1', { title: '   ' });
    expect(store.findBoard('b1')?.columns[0].cards[0].title).toBe('Card 1');
  });

  it('moves a card to another column at the drop index', () => {
    const store = setup([testBoard()]);
    store.moveCard('b1', 'c1', 'c2', 1, 0);
    expect(cardTitles(store, 'c1')).toEqual(['1', '3']);
    expect(cardTitles(store, 'c2')).toEqual(['2', '4']);
  });

  it('reorders cards inside one column', () => {
    const store = setup([testBoard()]);
    store.moveCard('b1', 'c1', 'c1', 0, 2);
    expect(cardTitles(store, 'c1')).toEqual(['2', '3', '1']);
  });

  it('ignores a move from an index that does not exist', () => {
    const store = setup([testBoard()]);
    const before = store.boards();
    store.moveCard('b1', 'c1', 'c2', 9, 0);
    expect(store.boards()).toBe(before);
  });

  it('adds, renames, reorders and deletes columns', () => {
    const store = setup([testBoard()]);
    store.addColumn('b1', 'Review');
    store.renameColumn('b1', 'c2', 'Shipped');
    store.moveColumn('b1', 2, 0);
    expect(store.findBoard('b1')?.columns.map((column) => column.title)).toEqual([
      'Review',
      'To do',
      'Shipped',
    ]);

    store.deleteColumn('b1', 'c1');
    expect(store.findBoard('b1')?.columns.map((column) => column.title)).toEqual([
      'Review',
      'Shipped',
    ]);
  });

  it('writes every change to storage', () => {
    const store = setup([testBoard()]);
    store.renameBoard('b1', 'Saved');
    TestBed.tick();
    expect(storage.data.get(BOARDS_STORAGE_KEY)).toEqual(store.boards());
  });
});
