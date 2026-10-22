import { Board } from '../models/board.model';
import { createCard, createColumn, createLabels } from './board-factory';

export const DEMO_BOARD_ID = 'demo';

/** yyyy-mm-dd for today shifted by `offsetDays`, so demo deadlines always look current. */
function dayFromToday(offsetDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function createDemoBoards(): Board[] {
  const labels = createLabels();
  const [feature, design, bug, testing, docs] = labels.map((label) => label.id);
  const now = new Date().toISOString();

  const portfolio: Board = {
    id: DEMO_BOARD_ID,
    title: 'Portfolio launch',
    labels,
    createdAt: now,
    columns: [
      createColumn('Backlog', [
        createCard('Cloud sync with Supabase', {
          description: 'Sign in and keep boards in sync across devices.',
          labelIds: [feature],
        }),
        createCard('Keyboard shortcuts', {
          description: 'N for a new card, / to focus search, Esc to close dialogs.',
          labelIds: [feature, design],
        }),
      ]),
      createColumn('To do', [
        createCard('Write unit tests for BoardStore', {
          labelIds: [testing],
          dueDate: dayFromToday(3),
        }),
        createCard('Record a demo GIF for the README', {
          labelIds: [docs],
          dueDate: dayFromToday(1),
        }),
      ]),
      createColumn('In progress', [
        createCard('Drag and drop between columns', {
          description: 'Use Angular CDK drag and drop. Cards and columns can both be reordered.',
          labelIds: [feature],
          dueDate: dayFromToday(0),
        }),
        createCard('Card disappears after a page reload', {
          description: 'Steps: add a card, press F5. Expected: the card is still there.',
          labelIds: [bug],
          dueDate: dayFromToday(-1),
        }),
      ]),
      createColumn('Done', [
        createCard('Set up routing and lazy loading', { labelIds: [feature] }),
        createCard('Dark theme', { labelIds: [design] }),
      ]),
    ],
  };

  const readingLabels = createLabels();
  const reading: Board = {
    id: 'reading',
    title: 'Learning Angular',
    labels: readingLabels,
    createdAt: now,
    columns: [
      createColumn('To read', [
        createCard('Signals in depth', { labelIds: [readingLabels[4].id] }),
        createCard('Deferrable views with @defer', { labelIds: [readingLabels[4].id] }),
      ]),
      createColumn('Reading', [
        createCard('Dependency injection guide', { labelIds: [readingLabels[4].id] }),
      ]),
      createColumn('Done', [createCard('Standalone components')]),
    ],
  };

  return [portfolio, reading];
}
