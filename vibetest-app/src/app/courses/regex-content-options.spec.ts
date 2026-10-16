import { RegexContentWithOptionsSchema } from './regex-content-options';

describe('RegexContentWithOptionsSchema', () => {
  const base = {
    description: 'd',
    starterCode: 'x',
    referenceSolution: 'y',
    timeoutMs: 2000,
    tests: [{ input: 'a' }],
  };

  it('requires replacement when mode is replace', () => {
    const result = RegexContentWithOptionsSchema.safeParse({
      ...base,
      mode: 'replace',
    });
    expect(result.success).toBe(false);
  });

  it('rejects flags with literal answerFormat', () => {
    const result = RegexContentWithOptionsSchema.safeParse({
      ...base,
      answerFormat: 'literal',
      flags: 'i',
    });
    expect(result.success).toBe(false);
  });

  it('rejects unordered when mode is not matchAll', () => {
    const result = RegexContentWithOptionsSchema.safeParse({
      ...base,
      mode: 'test',
      unordered: true,
    });
    expect(result.success).toBe(false);
  });

  it('accepts replace with replacement', () => {
    const result = RegexContentWithOptionsSchema.safeParse({
      ...base,
      mode: 'replace',
      replacement: '[$1]',
    });
    expect(result.success).toBe(true);
  });
});
