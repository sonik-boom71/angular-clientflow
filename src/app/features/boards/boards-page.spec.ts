import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { MemoryStorage, testBoard } from '../../../testing/memory-storage';
import { BOARDS_STORAGE_KEY, BoardStore } from '../../core/services/board-store';
import { StorageService } from '../../core/services/storage.service';
import { BoardsPage } from './boards-page';

describe('BoardsPage', () => {
  let fixture: ComponentFixture<BoardsPage>;
  let element: HTMLElement;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    const storage = new MemoryStorage();
    storage.data.set(BOARDS_STORAGE_KEY, [testBoard()]);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: StorageService, useValue: storage }],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(BoardsPage);
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  async function createBoard(name: string): Promise<void> {
    const field = element.querySelector<HTMLInputElement>('#new-board')!;
    field.value = name;
    field.dispatchEvent(new Event('input'));
    element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  it('shows a tile with stats for each board', () => {
    const tiles = element.querySelectorAll('.tile');
    expect(tiles.length).toBe(1);
    expect(tiles[0].textContent).toContain('Test board');
    expect(tiles[0].textContent).toContain('2 columns · 4 cards');
    expect(tiles[0].querySelector('a')?.getAttribute('href')).toBe('/board/b1');
  });

  it('creates a board and opens it', async () => {
    await createBoard('Side project');

    const store = TestBed.inject(BoardStore);
    const created = store.boards().find((board) => board.title === 'Side project');
    expect(created).toBeDefined();
    expect(navigate).toHaveBeenCalledWith(['/board', created!.id]);
    expect(element.querySelectorAll('.tile').length).toBe(2);
  });

  it('does not create a board without a name', async () => {
    await createBoard('   ');
    expect(TestBed.inject(BoardStore).boardCount()).toBe(1);
    expect(navigate).not.toHaveBeenCalled();
  });
});
