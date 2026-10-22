import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { createBoard, createCard, createColumn } from '../data/board-factory';
import { createDemoBoards } from '../data/demo-boards';
import { Board, Card, CardChanges, Column } from '../models/board.model';
import { StorageService } from './storage.service';

export const BOARDS_STORAGE_KEY = 'taskflow:v1:boards';

function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const result = [...items];
  const [item] = result.splice(from, 1);
  if (item !== undefined) {
    result.splice(Math.max(0, Math.min(to, result.length)), 0, item);
  }
  return result;
}

/**
 * Single source of truth for boards. State lives in a signal, every change is an
 * immutable update, and an effect writes the result to localStorage.
 */
@Injectable({ providedIn: 'root' })
export class BoardStore {
  private readonly storage = inject(StorageService);
  private readonly state = signal<Board[]>(this.loadInitialState());

  readonly boards = this.state.asReadonly();
  readonly boardCount = computed(() => this.state().length);

  constructor() {
    effect(() => this.storage.save(BOARDS_STORAGE_KEY, this.state()));
  }

  findBoard(boardId: string): Board | undefined {
    return this.state().find((board) => board.id === boardId);
  }

  createBoard(title: string): Board | null {
    const name = title.trim();
    if (!name) {
      return null;
    }
    const board = createBoard(name);
    this.state.update((boards) => [...boards, board]);
    return board;
  }

  renameBoard(boardId: string, title: string): void {
    const name = title.trim();
    if (name) {
      this.updateBoard(boardId, (board) => ({ ...board, title: name }));
    }
  }

  deleteBoard(boardId: string): void {
    this.state.update((boards) => boards.filter((board) => board.id !== boardId));
  }

  resetToDemo(): void {
    this.state.set(createDemoBoards());
  }

  addColumn(boardId: string, title: string): void {
    const name = title.trim();
    if (name) {
      this.updateBoard(boardId, (board) => ({
        ...board,
        columns: [...board.columns, createColumn(name)],
      }));
    }
  }

  renameColumn(boardId: string, columnId: string, title: string): void {
    const name = title.trim();
    if (name) {
      this.updateColumn(boardId, columnId, (column) => ({ ...column, title: name }));
    }
  }

  deleteColumn(boardId: string, columnId: string): void {
    this.updateBoard(boardId, (board) => ({
      ...board,
      columns: board.columns.filter((column) => column.id !== columnId),
    }));
  }

  moveColumn(boardId: string, fromIndex: number, toIndex: number): void {
    if (fromIndex !== toIndex) {
      this.updateBoard(boardId, (board) => ({
        ...board,
        columns: moveItem(board.columns, fromIndex, toIndex),
      }));
    }
  }

  addCard(boardId: string, columnId: string, title: string): Card | null {
    const name = title.trim();
    if (!name) {
      return null;
    }
    const card = createCard(name);
    this.updateColumn(boardId, columnId, (column) => ({
      ...column,
      cards: [...column.cards, card],
    }));
    return card;
  }

  updateCard(boardId: string, cardId: string, changes: CardChanges): void {
    const title = changes.title?.trim();
    if (title === '') {
      return;
    }
    this.updateBoard(boardId, (board) => ({
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.map((card) =>
          card.id === cardId ? { ...card, ...changes, ...(title ? { title } : {}) } : card,
        ),
      })),
    }));
  }

  deleteCard(boardId: string, cardId: string): void {
    this.updateBoard(boardId, (board) => ({
      ...board,
      columns: board.columns.map((column) => ({
        ...column,
        cards: column.cards.filter((card) => card.id !== cardId),
      })),
    }));
  }

  moveCard(
    boardId: string,
    fromColumnId: string,
    toColumnId: string,
    fromIndex: number,
    toIndex: number,
  ): void {
    this.updateBoard(boardId, (board) => {
      const source = board.columns.find((column) => column.id === fromColumnId);
      const card = source?.cards[fromIndex];
      if (!source || !card) {
        return board;
      }
      if (fromColumnId === toColumnId) {
        if (fromIndex === toIndex) {
          return board;
        }
        return {
          ...board,
          columns: board.columns.map((column) =>
            column.id === fromColumnId
              ? { ...column, cards: moveItem(column.cards, fromIndex, toIndex) }
              : column,
          ),
        };
      }
      return {
        ...board,
        columns: board.columns.map((column) => {
          if (column.id === fromColumnId) {
            return { ...column, cards: column.cards.filter((_, index) => index !== fromIndex) };
          }
          if (column.id === toColumnId) {
            const cards = [...column.cards];
            cards.splice(Math.max(0, Math.min(toIndex, cards.length)), 0, card);
            return { ...column, cards };
          }
          return column;
        }),
      };
    });
  }

  /** Replaces one board. A no-op change keeps the same array, so nothing re-renders or re-saves. */
  private updateBoard(boardId: string, change: (board: Board) => Board): void {
    this.state.update((boards) => {
      const index = boards.findIndex((board) => board.id === boardId);
      if (index === -1) {
        return boards;
      }
      const updated = change(boards[index]);
      if (updated === boards[index]) {
        return boards;
      }
      const next = [...boards];
      next[index] = updated;
      return next;
    });
  }

  private updateColumn(boardId: string, columnId: string, change: (column: Column) => Column) {
    this.updateBoard(boardId, (board) => ({
      ...board,
      columns: board.columns.map((column) => (column.id === columnId ? change(column) : column)),
    }));
  }

  private loadInitialState(): Board[] {
    const saved = this.storage.load<Board[]>(BOARDS_STORAGE_KEY);
    return Array.isArray(saved) ? saved : createDemoBoards();
  }
}
