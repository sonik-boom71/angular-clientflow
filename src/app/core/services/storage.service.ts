import { Injectable } from '@angular/core';

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
