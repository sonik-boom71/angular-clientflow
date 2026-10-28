import { normalizeBoards } from '../data/normalize';
import { Board } from '../models/board.model';

// UTF-8 byte order mark, so Excel reads Cyrillic correctly.
export const BOM = String.fromCharCode(0xfeff);

const CSV_HEADER = [
  'Stage',
  'Stage type',
  'Project',
  'Client',
  'Contact',
  'Value',
  'Currency',
  'Due date',
  'Labels',
  'Notes',
  'Created',
];

function csvCell(value: string | number | null): string {
  if (value === null) {
    return '';
  }
  let text = String(value);
  // Text that looks like a formula gets an apostrophe, so spreadsheets don't run it.
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return /[",;\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function boardToCsv(board: Board): string {
  const labelNames = new Map(board.labels.map((label) => [label.id, label.name]));
  const rows = board.columns.flatMap((column) =>
    column.cards.map((card) => [
      column.title,
      column.kind,
      card.title,
      card.client,
      card.contact,
      card.value,
      board.currency,
      card.dueDate,
      card.labelIds
        .map((id) => labelNames.get(id) ?? '')
        .filter(Boolean)
        .join(', '),
      card.description,
      card.createdAt.slice(0, 10),
    ]),
  );
  return BOM + [CSV_HEADER, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
}

export interface Backup {
  app: 'clientflow';
  version: 2;
  exportedAt: string;
  boards: Board[];
}

export function createBackup(boards: Board[]): string {
  const backup: Backup = {
    app: 'clientflow',
    version: 2,
    exportedAt: new Date().toISOString(),
    boards,
  };
  return JSON.stringify(backup, null, 2);
}

export function parseBackup(text: string): Board[] | null {
  try {
    const boards = normalizeBoards(JSON.parse(text));
    return boards && boards.length ? boards : null;
  } catch {
    return null;
  }
}

export function fileSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'pipeline'
  );
}
