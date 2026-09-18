import { Component, inject, signal } from '@angular/core';

import { CourseRepository } from '../../../storage/course-repository';
import { ProgressRepository } from '../../../storage/progress-repository';
import {
  courseStatisticsView,
  type CourseStatisticsView,
} from '../../course-statistics-view';
import { CourseStatisticsCardComponent } from '../../ui/course-statistics-card/course-statistics-card';

@Component({
  selector: 'app-statistics-page',
  imports: [CourseStatisticsCardComponent],
  templateUrl: './statistics-page.html',
  styleUrl: './statistics-page.scss',
})
export class StatisticsPage {
  private readonly courses = inject(CourseRepository);
  private readonly progress = inject(ProgressRepository);

  protected readonly items = signal<readonly CourseStatisticsView[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    void this.reload();
  }

  private async reload(): Promise<void> {
    this.loading.set(true);
    const courseList = await this.courses.list();
    const views = await Promise.all(
      courseList.map(async (course) => {
        const snapshots = await this.progress.listByCourseId(course.courseId);
        return courseStatisticsView(course, snapshots);
      }),
    );
    this.items.set(views);
    this.loading.set(false);
  }
}
