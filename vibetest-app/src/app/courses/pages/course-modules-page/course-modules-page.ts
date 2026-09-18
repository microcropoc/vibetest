import { Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';

import { stepProgressLookupFromSnapshots } from '../../../progress/progress-lookup';
import { CourseRepository } from '../../../storage/course-repository';
import { ProgressRepository } from '../../../storage/progress-repository';
import {
  moduleListItemView,
  type ModuleListItemView,
} from '../../module-list-item-view';
import { ModuleListCardComponent } from '../../ui/module-list-card/module-list-card';

@Component({
  selector: 'app-course-modules-page',
  imports: [ModuleListCardComponent],
  templateUrl: './course-modules-page.html',
  styleUrl: './course-modules-page.scss',
})
export class CourseModulesPage {
  readonly courseId = input.required<string>();

  private readonly courses = inject(CourseRepository);
  private readonly progress = inject(ProgressRepository);
  private readonly router = inject(Router);

  protected readonly courseTitle = signal('');
  protected readonly items = signal<readonly ModuleListItemView[]>([]);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);

  constructor() {
    effect(() => {
      const courseId = this.courseId();
      void this.reload(courseId);
    });
  }

  protected onExit(): void {
    void this.router.navigate(['/courses']);
  }

  protected onProceed(moduleId: string): void {
    void this.router.navigate(['/courses', this.courseId(), 'modules', moduleId]);
  }

  private async reload(courseId: string): Promise<void> {
    this.loading.set(true);
    this.notFound.set(false);

    const course = await this.courses.get(courseId);
    if (!course) {
      this.courseTitle.set('');
      this.items.set([]);
      this.notFound.set(true);
      this.loading.set(false);
      return;
    }

    const snapshots = await this.progress.listByCourseId(courseId);
    const lookup = stepProgressLookupFromSnapshots(snapshots);
    const views = course.modules.map((module) => moduleListItemView(module, lookup));

    this.courseTitle.set(course.title);
    this.items.set(views);
    this.loading.set(false);
  }
}
