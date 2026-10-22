import { Injectable } from '@angular/core';

/**
 * Thin wrapper around localStorage. Kept as a service so tests can replace it
 * and so private mode or a full quota never breaks the app.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  load<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  save(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage is unavailable or full: the app keeps working in memory.
    }
  }
}
