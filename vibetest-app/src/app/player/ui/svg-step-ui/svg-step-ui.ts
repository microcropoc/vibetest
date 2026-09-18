import { Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';

import type { Step } from '../../../courses/course.model';

type SvgStepContent = Extract<Step, { type: 'svg' }>['content'];

@Component({
  selector: 'app-svg-step-ui',
  templateUrl: './svg-step-ui.html',
  styleUrl: './svg-step-ui.scss',
})
export class SvgStepUiComponent {
  readonly content = input.required<SvgStepContent>();

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly svgHtml = computed((): SafeHtml =>
    this.sanitizer.bypassSecurityTrustHtml(this.content().svg),
  );
}
