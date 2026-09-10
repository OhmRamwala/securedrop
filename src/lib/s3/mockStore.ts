// Global mock storage for development without AWS credentials
const mockPartsStore: Map<string, Buffer> =
  (globalThis as any).__mockPartsStore ??
  ((globalThis as any).__mockPartsStore = new Map<string, Buffer>());

export function saveMockPart(key: string, part: number, data: Buffer): void {
  mockPartsStore.set(`${key}_part_${part}`, data);
}

export function getMockPart(key: string, part: number): Buffer | undefined {
  return mockPartsStore.get(`${key}_part_${part}`);
}

export function getAllMockParts(key: string): Buffer {
  const parts: Buffer[] = [];
  let i = 1;
  while (true) {
    const part = mockPartsStore.get(`${key}_part_${i}`);
    if (!part) break;
    parts.push(part);
    i++;
  }
  return Buffer.concat(parts);
}
