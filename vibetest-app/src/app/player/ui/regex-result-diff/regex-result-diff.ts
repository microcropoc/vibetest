import { Component, computed, input } from '@angular/core';

import {
  highlightSpansForDiff,
  type RegexCaseDiff,
  type RegexSerializedResult,
} from '../../../execution/regex-result';

interface RegexResultSide {
  readonly key: 'user' | 'expected';
  readonly title: string;
  readonly result: RegexSerializedResult;
}

interface InputSegment {
  readonly text: string;
  readonly highlight: boolean;
}

function buildInputSegments(preview: string, spans: readonly { readonly start: number; readonly end: number }[]): readonly InputSegment[] {
  if (spans.length === 0) {
    return [{ text: preview, highlight: false }];
  }
  const sorted = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
  const segments: InputSegment[] = [];
  let cursor = 0;
  for (const span of sorted) {
    const start = Math.max(span.start, cursor);
    if (span.end <= start) {
      continue;
    }
    if (start > cursor) {
      segments.push({ text: preview.slice(cursor, start), highlight: false });
    }
    segments.push({ text: preview.slice(start, span.end), highlight: true });
    cursor = span.end;
  }
  if (cursor < preview.length) {
    segments.push({ text: preview.slice(cursor), highlight: false });
  }
  return segments;
}

@Component({
  selector: 'app-regex-result-diff',
  templateUrl: './regex-result-diff.html',
  styleUrl: './regex-result-diff.scss',
})
export class RegexResultDiffComponent {
  readonly diff = input.required<RegexCaseDiff>();

  protected readonly mode = computed(() => this.diff().mode);

  protected readonly inputTruncated = computed(() => this.diff().inputTruncated);

  protected readonly showInputHighlights = computed(() => {
    const mode = this.mode();
    return mode === 'match' || mode === 'matchAll';
  });

  protected readonly inputSegments = computed((): readonly InputSegment[] => {
    const diff = this.diff();
    const preview = diff.inputPreview;
    if (!this.showInputHighlights()) {
      return [{ text: preview, highlight: false }];
    }
    return buildInputSegments(preview, highlightSpansForDiff(diff, 'user'));
  });

  protected readonly sides = computed((): readonly RegexResultSide[] => {
    const diff = this.diff();
    return [
      { key: 'user', title: 'Ваш результат', result: diff.user },
      { key: 'expected', title: 'Ожидается', result: diff.expected },
    ];
  });

  protected formatResult(result: RegexSerializedResult): string {
    switch (result.kind) {
      case 'test':
      case 'fullMatch':
        return result.value ? 'true' : 'false';
      case 'match':
        return result.match === null ? 'null' : JSON.stringify(result.match, null, 2);
      case 'matchAll':
        return JSON.stringify(
          { matches: result.matches, totalCount: result.totalCount },
          null,
          2,
        );
      case 'replace':
        return result.output;
      case 'split':
        return JSON.stringify({ items: result.items, totalCount: result.totalCount }, null, 2);
    }
  }

  protected resultTruncated(result: RegexSerializedResult): boolean {
    switch (result.kind) {
      case 'replace':
        return result.truncated;
      case 'matchAll':
        return result.totalCount > result.matches.length;
      case 'split':
        return result.totalCount > result.items.length;
      default:
        return false;
    }
  }
}
