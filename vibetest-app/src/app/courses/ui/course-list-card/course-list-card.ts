import { Component, input, output } from '@angular/core';

import type { CourseListItemView } from '../../course-list-item-view';

@Component({
  selector: 'app-course-list-card',
  templateUrl: './course-list-card.html',
  styleUrl: './course-list-card.scss',
})
export class CourseListCardComponent {
  readonly item = input.required<CourseListItemView>();

  readonly proceed = output<string>();
  readonly deleteRequested = output<string>();

  protected onProceed(): void {
    this.proceed.emit(this.item().courseId);
  }

  protected onDelete(): void {
    this.deleteRequested.emit(this.item().courseId);
  }
}
