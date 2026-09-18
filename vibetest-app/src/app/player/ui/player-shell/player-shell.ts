import { Component, input } from '@angular/core';

import type { Step } from '../../../courses/course.model';
import type { StepProgressSnapshot } from '../../step-engine/step-progress-snapshot';
import { SvgStepUiComponent } from '../svg-step-ui/svg-step-ui';
import { TheoryStepUiComponent } from '../theory-step-ui/theory-step-ui';

@Component({
  selector: 'app-player-shell',
  imports: [TheoryStepUiComponent, SvgStepUiComponent],
  templateUrl: './player-shell.html',
  styleUrl: './player-shell.scss',
})
export class PlayerShellComponent {
  readonly courseTitle = input('');
  readonly moduleTitle = input('');
  readonly step = input<Step | undefined>(undefined);
  readonly snapshot = input<StepProgressSnapshot | undefined>(undefined);
}
