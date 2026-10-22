import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MemoryStorage, testBoard, testCard } from '../../../testing/memory-storage';
import { CardChanges } from '../../core/models/board.model';
import { StorageService } from '../../core/services/storage.service';
import { CardDialog } from './card-dialog';

describe('CardDialog', () => {
  let fixture: ComponentFixture<CardDialog>;
  let element: HTMLElement;
  let saved: CardChanges[];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useValue: new MemoryStorage() }],
    });
    fixture = TestBed.createComponent(CardDialog);
    fixture.componentRef.setInput(
      'card',
      testCard('1', {
        title: 'Landing page',
        client: 'Brew & Co',
        value: 900,
        description: 'Menu and booking form',
        labelIds: ['l1'],
        history: [
          { columnId: 'c1', columnTitle: 'Leads', at: '2026-10-01T10:00:00.000Z' },
          { columnId: 'c2', columnTitle: 'Proposal sent', at: '2026-10-05T10:00:00.000Z' },
        ],
      }),
    );
    fixture.componentRef.setInput('labels', testBoard().labels);
    fixture.componentRef.setInput('columnTitle', 'Proposal sent');
    saved = [];
    fixture.componentInstance.saved.subscribe((changes) => saved.push(changes));
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  const input = (selector: string) => element.querySelector<HTMLInputElement>(selector)!;

  function type(selector: string, value: string): void {
    const field = input(selector);
    field.value = value;
    field.dispatchEvent(new Event('input'));
    field.dispatchEvent(new Event('blur'));
  }

  async function submit(): Promise<void> {
    element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    await fixture.whenStable();
  }

  it('fills the form from the deal', () => {
    expect(input('#card-title').value).toBe('Landing page');
    expect(input('#card-client').value).toBe('Brew & Co');
    expect(input('#card-value').value).toBe('900');
    expect(element.querySelector('textarea')!.value).toBe('Menu and booking form');
    const boxes = element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    expect([...boxes].map((box) => box.checked)).toEqual([true, false]);
  });

  it('shows the activity log, newest first', () => {
    const items = [...element.querySelectorAll('.history__list li span')].map((item) =>
      item.textContent?.trim(),
    );
    expect(items).toEqual(['Moved to Proposal sent', 'Created in Leads']);
  });

  it('blocks saving a blank title and explains why', async () => {
    type('#card-title', '   ');
    await submit();

    expect(saved).toEqual([]);
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Enter a project name.');
  });

  it('blocks a negative amount', async () => {
    type('#card-value', '-10');
    await submit();

    expect(saved).toEqual([]);
    expect(element.textContent).toContain('Enter an amount of 0 or more.');
  });

  it('emits trimmed changes on save', async () => {
    type('#card-title', '  Landing page v2  ');
    type('#card-contact', ' hello@brew.example ');
    type('#card-value', '1250');
    type('#card-due', '2026-11-05');
    element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[1].click();
    await submit();

    expect(saved).toEqual([
      {
        title: 'Landing page v2',
        client: 'Brew & Co',
        contact: 'hello@brew.example',
        value: 1250,
        dueDate: '2026-11-05',
        labelIds: ['l1', 'l2'],
        description: 'Menu and booking form',
      },
    ]);
  });

  it('saves an empty amount and date as "not set"', async () => {
    type('#card-value', '');
    type('#card-due', '');
    await submit();
    expect(saved[0]).toMatchObject({ value: null, dueDate: null });
  });
});
