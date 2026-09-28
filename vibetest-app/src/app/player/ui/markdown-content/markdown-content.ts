import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

import {
  renderInlineMarkdownToHtml,
  renderMarkdownToHtml,
} from '../../markdown/render-markdown';

@Component({
  selector: 'app-markdown-content',
  templateUrl: './markdown-content.html',
  styleUrl: './markdown-content.scss',
  host: {
    '[class.markdown-content--host-inline]': 'inline()',
  },
})
export class MarkdownContentComponent {
  readonly markdown = input.required<string>();
  readonly inline = input(false);

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly html = computed((): SafeHtml => {
    const source = this.markdown();
    const rendered = this.inline()
      ? renderInlineMarkdownToHtml(source)
      : renderMarkdownToHtml(source);
    return this.sanitizer.bypassSecurityTrustHtml(rendered);
  });
}
