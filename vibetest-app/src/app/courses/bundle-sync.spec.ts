import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('bundled course schemas', () => {
  it('course.schema.json matches docs/schemas/course.schema.json', () => {
    const docsPath = join(process.cwd(), '..', 'docs', 'schemas', 'course.schema.json');
    const publicPath = join(process.cwd(), 'public', 'schemas', 'course.schema.json');
    const docs = JSON.parse(readFileSync(docsPath, 'utf8'));
    const bundled = JSON.parse(readFileSync(publicPath, 'utf8'));
    expect(bundled).toEqual(docs);
  });

  it('course-import.schema.json matches docs/schemas/course-import.schema.json', () => {
    const docsPath = join(process.cwd(), '..', 'docs', 'schemas', 'course-import.schema.json');
    const publicPath = join(process.cwd(), 'public', 'schemas', 'course-import.schema.json');
    const docs = JSON.parse(readFileSync(docsPath, 'utf8'));
    const bundled = JSON.parse(readFileSync(publicPath, 'utf8'));
    expect(bundled).toEqual(docs);
  });

  it('module-import.schema.json matches docs/schemas/module-import.schema.json', () => {
    const docsPath = join(process.cwd(), '..', 'docs', 'schemas', 'module-import.schema.json');
    const publicPath = join(process.cwd(), 'public', 'schemas', 'module-import.schema.json');
    const docs = JSON.parse(readFileSync(docsPath, 'utf8'));
    const bundled = JSON.parse(readFileSync(publicPath, 'utf8'));
    expect(bundled).toEqual(docs);
  });
});
