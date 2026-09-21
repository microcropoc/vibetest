import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { CourseRepository } from '../../../storage/course-repository';
import { ProgressRepository } from '../../../storage/progress-repository';
import {
  courseListItemView,
  type CourseListItemView,
} from '../../course-list-item-view';
import { sortCoursesByCreatedAtDesc } from '../../sort-courses-by-created-at';
import { CourseListCardComponent } from '../../ui/course-list-card/course-list-card';

@Component({
  selector: 'app-courses-page',
  imports: [CourseListCardComponent, ConfirmDialogComponent],
  templateUrl: './courses-page.html',
  styleUrl: './courses-page.scss',
})
export class CoursesPage {
  private readonly courses = inject(CourseRepository);
  private readonly progress = inject(ProgressRepository);
  private readonly router = inject(Router);

  protected readonly items = signal<readonly CourseListItemView[]>([]);
  protected readonly loading = signal(true);
  protected readonly deleteTarget = signal<CourseListItemView | null>(null);

  protected readonly deleteDialogOpen = computed(() => this.deleteTarget() !== null);
  protected readonly deleteDialogMessage = computed(() => {
    const target = this.deleteTarget();
    if (!target) {
      return '';
    }
    return `Удалить курс «${target.title}» и весь прогресс?`;
  });

  constructor() {
    void this.reload();
  }

  protected onProceed(courseId: string): void {
    void this.router.navigate(['/courses', courseId]);
  }

  protected onDeleteRequested(courseId: string): void {
    const target = this.items().find((item) => item.courseId === courseId) ?? null;
    this.deleteTarget.set(target);
  }

  protected onDeleteCancelled(): void {
    this.deleteTarget.set(null);
  }

  protected onDeleteConfirmed(): void {
    const target = this.deleteTarget();
    if (!target) {
      return;
    }
    this.deleteTarget.set(null);
    void this.deleteCourse(target.courseId);
  }

  private async reload(): Promise<void> {
    this.loading.set(true);
    const courseList = sortCoursesByCreatedAtDesc(await this.courses.list());
    const views = await Promise.all(
      courseList.map(async (course) => {
        const snapshots = await this.progress.listByCourseId(course.courseId);
        return courseListItemView(course, snapshots);
      }),
    );
    this.items.set(views);
    this.loading.set(false);
  }

  private async deleteCourse(courseId: string): Promise<void> {
    await this.courses.delete(courseId);
    await this.reload();
  }
}
