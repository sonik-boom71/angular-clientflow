import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { MemoryStorage, testBoard } from '../../../testing/memory-storage';
import { BOARDS_STORAGE_KEY, BoardStore } from '../../core/services/board-store';
import { StorageService } from '../../core/services/storage.service';
import { createBackup } from '../../core/utils/export';
import { PipelinesPage } from './pipelines-page';

describe('PipelinesPage', () => {
  let fixture: ComponentFixture<PipelinesPage>;
  let element: HTMLElement;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    const storage = new MemoryStorage();
    storage.data.set(BOARDS_STORAGE_KEY, [testBoard()]);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: StorageService, useValue: storage }],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(PipelinesPage);
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  afterEach(() => vi.restoreAllMocks());

  const store = () => TestBed.inject(BoardStore);

  async function createBoard(name: string): Promise<void> {
    const field = element.querySelector<HTMLInputElement>('#new-board')!;
    field.value = name;
    field.dispatchEvent(new Event('input'));
    element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  async function importFile(content: string): Promise<void> {
    const input = element.querySelector<HTMLInputElement>('#import-backup')!;
    const file = new File([content], 'backup.json', { type: 'application/json' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    await vi.waitFor(() => expect(element.querySelector('[role="status"]')).not.toBeNull());
    await fixture.whenStable();
  }

  it('shows a tile with deal count and money for each pipeline', () => {
    const tiles = element.querySelectorAll('.tile');
    expect(tiles.length).toBe(1);
    expect(tiles[0].textContent).toContain('Test pipeline');
    expect(tiles[0].textContent).toContain('4 deals · USD');
    expect(tiles[0].textContent).toContain('$0 open');
    expect(tiles[0].textContent).toContain('$1,000 earned');
    expect(tiles[0].querySelector('a')?.getAttribute('href')).toBe('/board/b1');
  });

  it('creates a pipeline and opens it', async () => {
    await createBoard('Agency work');

    const created = store()
      .boards()
      .find((board) => board.title === 'Agency work');
    expect(created).toBeDefined();
    expect(navigate).toHaveBeenCalledWith(['/board', created!.id]);
  });

  it('does not create a pipeline without a name', async () => {
    await createBoard('   ');
    expect(store().boardCount()).toBe(1);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('restores a backup after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const backup = { ...testBoard(), id: 'restored', title: 'From backup' };
    await importFile(createBackup([backup]));

    expect(
      store()
        .boards()
        .map((board) => board.id),
    ).toEqual(['restored']);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Backup restored.');
  });

  it('explains when a file is not a backup', async () => {
    await importFile('{"nope": true}');

    expect(
      store()
        .boards()
        .map((board) => board.id),
    ).toEqual(['b1']);
    expect(element.querySelector('[role="status"]')?.textContent).toContain(
      'isn’t a ClientFlow backup',
    );
  });
});
