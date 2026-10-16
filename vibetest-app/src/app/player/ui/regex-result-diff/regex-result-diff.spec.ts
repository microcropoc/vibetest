import { TestBed } from '@angular/core/testing';

import type { RegexCaseDiff } from '../../../execution/regex-result';

import { RegexResultDiffComponent } from './regex-result-diff';

const testDiff: RegexCaseDiff = {
  mode: 'test',
  inputPreview: 'hello',
  inputTruncated: false,
  user: { kind: 'test', value: false },
  expected: { kind: 'test', value: true },
};

describe('RegexResultDiffComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegexResultDiffComponent],
    }).compileComponents();
  });

  it('shows both sides and input', async () => {
    const fixture = TestBed.createComponent(RegexResultDiffComponent);
    fixture.componentRef.setInput('diff', testDiff);
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Вход');
    expect(text).toContain('Ваш результат');
    expect(text).toContain('Ожидается');
    expect(text).toContain('hello');
  });

  it('highlights match spans for match mode', async () => {
    const fixture = TestBed.createComponent(RegexResultDiffComponent);
    fixture.componentRef.setInput('diff', {
      mode: 'match',
      inputPreview: 'ab12cd',
      inputTruncated: false,
      user: {
        kind: 'match',
        match: { match: '12', index: 2, groups: [] },
      },
      expected: {
        kind: 'match',
        match: { match: '12', index: 2, groups: [] },
      },
    });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mark.regex-result-diff__mark')?.textContent).toBe('12');
  });

  it('does not duplicate input text when match spans overlap', async () => {
    const fixture = TestBed.createComponent(RegexResultDiffComponent);
    fixture.componentRef.setInput('diff', {
      mode: 'matchAll',
      inputPreview: 'abc',
      inputTruncated: false,
      user: {
        kind: 'matchAll',
        matches: [
          { match: 'ab', index: 0, groups: [] },
          { match: 'a', index: 0, groups: [] },
        ],
        totalCount: 2,
      },
      expected: {
        kind: 'matchAll',
        matches: [],
        totalCount: 0,
      },
    });
    await fixture.whenStable();
    const code = fixture.nativeElement.querySelector('.regex-result-diff__input-text code');
    expect(code?.textContent?.replace(/\s/g, '')).toBe('abc');
  });
});
