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

  async function render(): Promise<HTMLElement> {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return fixture.nativeElement;
  }

  it('renders the header and a router outlet', async () => {
    const element = await render();
    expect(element.querySelector('app-header a')?.textContent).toContain('ClientFlow');
    expect(element.querySelector('main router-outlet')).not.toBeNull();
  });

  it('applies the theme to the document', async () => {
    await render();
    expect(['light', 'dark']).toContain(document.documentElement.dataset['theme']);
  });

  it('switches the interface language from the header', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const nav = () => element.querySelector('.header__link')?.textContent?.trim();
    expect(nav()).toBe('Pipelines');

    const [, ukrainian] = element.querySelectorAll<HTMLButtonElement>('.lang__option');
    ukrainian.click();
    await fixture.whenStable();

    expect(nav()).toBe('Воронки');
    expect(ukrainian.getAttribute('aria-pressed')).toBe('true');
  });
});
