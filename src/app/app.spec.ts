import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { MemoryStorage } from '../testing/memory-storage';
import { App } from './app';
import { StorageService } from './core/services/storage.service';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: StorageService, useValue: new MemoryStorage() }],
    });
  });

  it('renders the header and a router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-header a')?.textContent).toContain('TaskFlow');
    expect(element.querySelector('main router-outlet')).not.toBeNull();
  });

  it('applies the theme to the document', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(['light', 'dark']).toContain(document.documentElement.dataset['theme']);
  });
});
