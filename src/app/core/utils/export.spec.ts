import { testBoard, testCard } from '../../../testing/memory-storage';
import { BOM, boardToCsv, createBackup, fileSlug, parseBackup } from './export';

describe('export', () => {
  describe('boardToCsv', () => {
    function csvLines(): string[] {
      const board = testBoard();
      board.columns[0].cards = [
        testCard('1', {
          title: 'Site, "v2"',
          client: '=HYPERLINK("http://evil")',
          value: 1200,
          dueDate: '2026-11-01',
          labelIds: ['l1', 'l2'],
          description: 'Line one\nLine two',
        }),
      ];
      board.columns[1].cards = [];
      return boardToCsv(board).split('\r\n');
    }

    it('starts with a BOM and a header row', () => {
      const [header] = csvLines();
      expect(header.charCodeAt(0)).toBe(0xfeff);
      expect(header.startsWith(`${BOM}Stage,Stage type,Project,Client`)).toBe(true);
    });

    it('quotes commas, quotes and new lines', () => {
      const csv = csvLines().slice(1).join('\r\n');
      expect(csv).toContain('"Site, ""v2"""');
      expect(csv).toContain('"Line one\nLine two"');
      expect(csv).toContain('"Website, Urgent"');
      expect(csv).toContain(',1200,USD,2026-11-01,');
    });

    it('defuses cells that a spreadsheet would run as a formula', () => {
      expect(csvLines()[1]).toContain(`"'=HYPERLINK(""http://evil"")"`);
    });
  });

  describe('backups', () => {
    it('round-trips pipelines through a backup file', () => {
      const boards = [testBoard()];
      const text = createBackup(boards);
      expect(JSON.parse(text)).toMatchObject({ app: 'clientflow', version: 2 });
      expect(parseBackup(text)).toEqual(boards);
    });

    it('rejects files that are not backups', () => {
      expect(parseBackup('not json')).toBeNull();
      expect(parseBackup('{"hello": "world"}')).toBeNull();
      expect(parseBackup('[]')).toBeNull();
    });
  });

  it('makes file-name-safe slugs and keeps Cyrillic', () => {
    expect(fileSlug('Freelance 2026!')).toBe('freelance-2026');
    expect(fileSlug('Фриланс 2026')).toBe('фриланс-2026');
    expect(fileSlug('***')).toBe('pipeline');
  });
});
