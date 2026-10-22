import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { MemoryStorage, testBoard } from '../../../testing/memory-storage';
import { DEMO_BOARD_ID } from '../../core/data/demo-boards';
import { BOARDS_STORAGE_KEY, BoardStore } from '../../core/services/board-store';
import { StorageService } from '../../core/services/storage.service';
import { LandingPage } from './landing-page';

describe('LandingPage', () => {
  let fixture: ComponentFixture<LandingPage>;
  let element: HTMLElement;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    const storage = new MemoryStorage();
    storage.data.set(BOARDS_STORAGE_KEY, [testBoard()]);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: StorageService, useValue: storage }],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(LandingPage);
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  const buttons = () => [...element.querySelectorAll<HTMLButtonElement>('.hero__actions button')];

  it('explains the product and shows a matching screenshot', () => {
    expect(element.querySelector('h1')?.textContent).toContain('from first message to paid');
    expect(element.querySelectorAll('.feature').length).toBe(6);
    expect(element.querySelector('img')?.getAttribute('src')).toMatch(
      /^screenshots\/pipeline-en-(light|dark)\.png$/,
    );
  });

  it('opens the demo, bringing it back if it was deleted', () => {
    buttons()[0].click();

    expect(TestBed.inject(BoardStore).findBoard(DEMO_BOARD_ID)).toBeDefined();
    expect(navigate).toHaveBeenCalledWith(['/board', DEMO_BOARD_ID]);
  });

  it('starts an empty pipeline', () => {
    buttons()[1].click();

    const created = TestBed.inject(BoardStore)
      .boards()
      .find((board) => board.title === 'My pipeline');
    expect(created?.columns.every((column) => column.cards.length === 0)).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/board', created!.id]);
  });
});
