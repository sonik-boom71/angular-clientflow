import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { createBoard, createCard, createColumn } from '../data/board-factory';
import { DEMO_BOARD_ID, createDemoBoard } from '../data/demo-boards';
import { normalizeBoards } from '../data/normalize';
import { I18n } from '../i18n/i18n.service';
import {
  Board,
  Card,
  CardChanges,
  Column,
  Currency,
  StageEvent,
  StageKind,
} from '../models/board.model';
import { StorageService } from './storage.service';

export const BOARDS_STORAGE_KEY = 'clientflow:v2:boards';
/** Where TaskFlow v1 kept its boards; read once to migrate them. */
export const LEGACY_STORAGE_KEY = 'taskflow:v1:boards';
const LEGACY_DEMO_IDS = ['demo', 'reading'];

function moveItem<T>(items: readonly T[], from: number, to: number): T[] {
  const result = [...items];
  const [item] = result.splice(from, 1);
  if (item !== undefined) {
    result.splice(Math.max(0, Math.min(to, result.length)), 0, item);
  }
  return result;
}

/**
 * Single source of truth for pipelines. State lives in a signal, every change is an
 * immutable update, and an effect writes the result to localStorage.
 */
@Injectable({ providedIn: 'root' })
export class BoardStore {
  private readonly storage = inject(StorageService);
  private readonly i18n = inject(I18n);
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
    const board = createBoard(name, this.i18n.lang());
    this.state.update((boards) => [...boards, board]);
    return board;
  }

  renameBoard(boardId: string, title: string): void {
    const name = title.trim();
    if (name) {
      this.updateBoard(boardId, (board) => ({ ...board, title: name }));
    }
  }

  setCurrency(boardId: string, currency: Currency): void {
    this.updateBoard(boardId, (board) =>
      board.currency === currency ? board : { ...board, currency },
    );
  }

  deleteBoard(boardId: string): void {
    this.state.update((boards) => boards.filter((board) => board.id !== boardId));
  }

  resetToDemo(): void {
    this.state.set([createDemoBoard(this.i18n.lang())]);
  }

  /** Brings the demo pipeline back if it was deleted, and returns its id. */
  ensureDemoBoard(): string {
    if (!this.findBoard(DEMO_BOARD_ID)) {
      this.state.update((boards) => [createDemoBoard(this.i18n.lang()), ...boards]);
    }
    return DEMO_BOARD_ID;
  }

  replaceAll(boards: Board[]): void {
    this.state.set(boards);
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

  setColumnKind(boardId: string, columnId: string, kind: StageKind): void {
    this.updateColumn(boardId, columnId, (column) =>
      column.kind === kind ? column : { ...column, kind },
    );
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
    const column = this.findBoard(boardId)?.columns.find((c) => c.id === columnId);
    if (!name || !column) {
      return null;
    }
    const card = createCard(name, column);
    this.updateColumn(boardId, columnId, (current) => ({
      ...current,
      cards: [...current.cards, card],
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

  /** Moves a deal. A move to another stage restarts its idle timer and is logged in its history. */
  moveCard(
    boardId: string,
    fromColumnId: string,
    toColumnId: string,
    fromIndex: number,
    toIndex: number,
  ): void {
    this.updateBoard(boardId, (board) => {
      const source = board.columns.find((column) => column.id === fromColumnId);
      const target = board.columns.find((column) => column.id === toColumnId);
      const card = source?.cards[fromIndex];
      if (!source || !target || !card) {
        return board;
      }
      if (source === target) {
        if (fromIndex === toIndex) {
          return board;
        }
        return {
          ...board,
          columns: board.columns.map((column) =>
            column === source
              ? { ...column, cards: moveItem(column.cards, fromIndex, toIndex) }
              : column,
          ),
        };
      }

      const now = new Date().toISOString();
      const event: StageEvent = { columnId: target.id, columnTitle: target.title, at: now };
      const moved: Card = { ...card, stageEnteredAt: now, history: [...card.history, event] };
      return {
        ...board,
        columns: board.columns.map((column) => {
          if (column === source) {
            return { ...column, cards: column.cards.filter((_, index) => index !== fromIndex) };
          }
          if (column === target) {
            const cards = [...column.cards];
            cards.splice(Math.max(0, Math.min(toIndex, cards.length)), 0, moved);
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
    this.updateBoard(boardId, (board) => {
      let changed = false;
      const columns = board.columns.map((column) => {
        if (column.id !== columnId) {
          return column;
        }
        const updated = change(column);
        changed = updated !== column;
        return updated;
      });
      return changed ? { ...board, columns } : board;
    });
  }

  private loadInitialState(): Board[] {
    const saved = normalizeBoards(this.storage.load<unknown>(BOARDS_STORAGE_KEY));
    if (saved) {
      return saved;
    }
    const demo = createDemoBoard(this.i18n.lang());
    // First visit since the TaskFlow → ClientFlow change: keep the user's own boards,
    // replace the old task demo with the new pipeline demo.
    const legacy = normalizeBoards(this.storage.load<unknown>(LEGACY_STORAGE_KEY));
    const ownBoards = legacy?.filter((board) => !LEGACY_DEMO_IDS.includes(board.id)) ?? [];
    return [demo, ...ownBoards];
  }
}
