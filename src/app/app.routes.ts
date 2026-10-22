import { Routes } from '@angular/router';

import { boardExistsGuard } from './core/guards/board-exists.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Boards · TaskFlow',
    loadComponent: () => import('./features/boards/boards-page').then((m) => m.BoardsPage),
  },
  {
    path: 'board/:id',
    canActivate: [boardExistsGuard],
    loadComponent: () => import('./features/board/board-page').then((m) => m.BoardPage),
  },
  {
    path: '**',
    title: 'Page not found · TaskFlow',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
