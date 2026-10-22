import { Board, Card } from '../app/core/models/board.model';
import { StorageService } from '../app/core/services/storage.service';

/** In-memory stand-in for StorageService, so tests never touch real localStorage. */
export class MemoryStorage implements Pick<StorageService, 'load' | 'save'> {
  readonly data = new Map<string, unknown>();

  load<T>(key: string): T | null {
    return (this.data.get(key) as T | undefined) ?? null;
  }

  save(key: string, value: unknown): void {
    this.data.set(key, structuredClone(value));
  }
}

export function testCard(id: string, extra: Partial<Card> = {}): Card {
  return {
    id,
    title: `Card ${id}`,
    description: '',
    labelIds: [],
    dueDate: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...extra,
  };
}

/** Board "b1" with columns c1 (cards 1, 2, 3) and c2 (card 4). */
export function testBoard(): Board {
  return {
    id: 'b1',
    title: 'Test board',
    createdAt: '2026-01-01T00:00:00.000Z',
    labels: [
      { id: 'l1', name: 'Feature', color: 'blue' },
      { id: 'l2', name: 'Bug', color: 'red' },
    ],
    columns: [
      { id: 'c1', title: 'To do', cards: [testCard('1'), testCard('2'), testCard('3')] },
      { id: 'c2', title: 'Done', cards: [testCard('4')] },
    ],
  };
}
