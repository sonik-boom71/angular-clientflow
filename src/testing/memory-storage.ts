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
    title: `Deal ${id}`,
    client: '',
    contact: '',
    value: null,
    description: '',
    labelIds: [],
    dueDate: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    stageEnteredAt: '2026-01-01T00:00:00.000Z',
    history: [{ columnId: 'c1', columnTitle: 'Leads', at: '2026-01-01T00:00:00.000Z' }],
    ...extra,
  };
}

/**
 * Pipeline "b1" in USD: c1 Leads (deals 1, 2, 3), c2 Paid (deal 4, $1,000),
 * c3 Lost (empty).
 */
export function testBoard(): Board {
  return {
    id: 'b1',
    title: 'Test pipeline',
    currency: 'USD',
    createdAt: '2026-01-01T00:00:00.000Z',
    labels: [
      { id: 'l1', name: 'Website', color: 'blue' },
      { id: 'l2', name: 'Urgent', color: 'red' },
    ],
    columns: [
      {
        id: 'c1',
        title: 'Leads',
        kind: 'open',
        cards: [testCard('1'), testCard('2'), testCard('3')],
      },
      { id: 'c2', title: 'Paid', kind: 'won', cards: [testCard('4', { value: 1000 })] },
      { id: 'c3', title: 'Lost', kind: 'lost', cards: [] },
    ],
  };
}
