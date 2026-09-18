import { Component, input } from '@angular/core';

import type { CourseStatisticsView } from '../../course-statistics-view';

@Component({
  selector: 'app-course-statistics-card',
  templateUrl: './course-statistics-card.html',
  styleUrl: './course-statistics-card.scss',
})
export class CourseStatisticsCardComponent {
  readonly item = input.required<CourseStatisticsView>();
}
