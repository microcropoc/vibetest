import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

import { renderMarkdownToHtml } from '../../markdown/render-markdown';

@Component({
  selector: 'app-theory-step-ui',
  templateUrl: './theory-step-ui.html',
  styleUrl: './theory-step-ui.scss',
})
export class TheoryStepUiComponent {
  readonly markdown = input.required<string>();

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly html = computed((): SafeHtml => {
    const rendered = renderMarkdownToHtml(this.markdown());
    return this.sanitizer.bypassSecurityTrustHtml(rendered);
  });
}
