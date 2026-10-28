export function createId(): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) {
    return uuid.slice(0, 8) + uuid.slice(9, 13);
  }
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}
