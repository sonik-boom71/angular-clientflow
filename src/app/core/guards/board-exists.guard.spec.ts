import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  convertToParamMap,
  provideRouter,
} from '@angular/router';

import { MemoryStorage, testBoard } from '../../../testing/memory-storage';
import { BOARDS_STORAGE_KEY } from '../services/board-store';
import { StorageService } from '../services/storage.service';
import { boardExistsGuard } from './board-exists.guard';

describe('boardExistsGuard', () => {
  beforeEach(() => {
    const storage = new MemoryStorage();
    storage.data.set(BOARDS_STORAGE_KEY, [testBoard()]);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: StorageService, useValue: storage }],
    });
  });

  const run = (id: string) =>
    TestBed.runInInjectionContext(() =>
      boardExistsGuard(
        { paramMap: convertToParamMap({ id }) } as ActivatedRouteSnapshot,
        {} as RouterStateSnapshot,
      ),
    );

  it('lets the user open an existing board', () => {
    expect(run('b1')).toBe(true);
  });

  it('redirects to the boards list when the board is missing', () => {
    const result = run('missing');
    expect(result).toBeInstanceOf(UrlTree);
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe('/');
  });
});
