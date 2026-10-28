import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { BoardStore } from '../services/board-store';

export const boardExistsGuard: CanActivateFn = (route) => {
  const store = inject(BoardStore);
  const router = inject(Router);
  const boardId = route.paramMap.get('id');
  return boardId && store.findBoard(boardId) ? true : router.createUrlTree(['/pipelines']);
};
