import { Component, input } from '@angular/core';

import { MarkdownContentComponent } from '../markdown-content/markdown-content';

@Component({
  selector: 'app-theory-step-ui',
  imports: [MarkdownContentComponent],
  templateUrl: './theory-step-ui.html',
})
export class TheoryStepUiComponent {
  readonly markdown = input.required<string>();
}
