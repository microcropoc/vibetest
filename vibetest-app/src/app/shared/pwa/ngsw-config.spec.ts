import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('ngsw-config.json', () => {
  it('caches offline assets including sql.js wasm and course schema', () => {
    const path = join(process.cwd(), 'ngsw-config.json');
    const config = JSON.parse(readFileSync(path, 'utf8')) as {
      assetGroups: { installMode: string; resources: { files: string[] } }[];
    };

    const files = config.assetGroups.flatMap((group) => group.resources.files);
    const prefetched = config.assetGroups
      .filter((group) => group.installMode === 'prefetch')
      .flatMap((group) => group.resources.files);
    expect(prefetched).toContain('/sql-wasm.wasm');
    expect(files.some((file) => file.includes('schemas'))).toBe(true);
  });
});
