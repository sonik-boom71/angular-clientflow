import { Routes } from '@angular/router';

import { boardExistsGuard } from './core/guards/board-exists.guard';

// Titles are translation keys, see TranslatedTitleStrategy.
export const routes: Routes = [
  {
    path: '',
    title: 'title.home',
    loadComponent: () => import('./features/landing/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'pipelines',
    title: 'title.pipelines',
    loadComponent: () => import('./features/pipelines/pipelines-page').then((m) => m.PipelinesPage),
  },
  {
    path: 'board/:id',
    canActivate: [boardExistsGuard],
    loadComponent: () => import('./features/board/board-page').then((m) => m.BoardPage),
  },
  {
    path: 'board/:id/insights',
    canActivate: [boardExistsGuard],
    loadComponent: () => import('./features/insights/insights-page').then((m) => m.InsightsPage),
  },
  {
    path: '**',
    title: 'title.notFound',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
