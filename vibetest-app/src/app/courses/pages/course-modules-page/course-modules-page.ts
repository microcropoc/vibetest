import { Component, input } from '@angular/core';

@Component({
  selector: 'app-course-modules-page',
  templateUrl: './course-modules-page.html',
  styleUrl: '../../../shared/ui/page-placeholder/page-placeholder.scss',
})
export class CourseModulesPage {
  readonly courseId = input.required<string>();
}
