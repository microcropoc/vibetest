import { Component, input } from '@angular/core';

import type { CourseOutline } from '../../course-outline.model';
import type { GenerationStageStatus, GenerationStageView } from '../../generation-stage-view';

const STATUS_LABELS: Record<GenerationStageStatus, string> = {
  pending: 'ожидание',
  running: 'выполняется',
  done: 'готово',
  failed: 'ошибка',
};

@Component({
  selector: 'app-generation-stages',
  templateUrl: './generation-stages.html',
  styleUrl: './generation-stages.scss',
})
export class GenerationStages {
  readonly stages = input.required<readonly GenerationStageView[]>();
  readonly outline = input<CourseOutline | null>(null);

  protected statusLabel(status: GenerationStageStatus): string {
    return STATUS_LABELS[status];
  }
}
