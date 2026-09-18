import { Component, input } from '@angular/core';

import type { Step } from '../../../courses/course.model';
import type { StepProgressSnapshot } from '../../step-engine/step-progress-snapshot';

/**
 * Player chrome + step outlet placeholder (vt-21–23 register step UI here).
 */
@Component({
  selector: 'app-player-shell',
  templateUrl: './player-shell.html',
  styleUrl: './player-shell.scss',
})
export class PlayerShellComponent {
  readonly courseTitle = input('');
  readonly moduleTitle = input('');
  readonly step = input<Step | undefined>(undefined);
  readonly snapshot = input<StepProgressSnapshot | undefined>(undefined);
}
