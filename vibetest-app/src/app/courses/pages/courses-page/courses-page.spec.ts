import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import type { Course } from '../../course.model';
import { courseListItemView } from '../../course-list-item-view';
import { minimalValidCourseJson } from '../../__fixtures__/course-fixtures';
import { parseCourse } from '../../parse-course';
import { CourseRepository } from '../../../storage/course-repository';
import { ProgressRepository } from '../../../storage/progress-repository';

import { CoursesPage } from './courses-page';

describe('CoursesPage', () => {
  const course = parseCourse(minimalValidCourseJson());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursesPage],
      providers: [
        provideRouter([{ path: 'courses/:courseId', component: CoursesPage }]),
        {
          provide: CourseRepository,
          useValue: {
            list: vi.fn().mockResolvedValue([course] as readonly Course[]),
            delete: vi.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ProgressRepository,
          useValue: {
            listByCourseId: vi.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compileComponents();
  });

  it('shows course card with title and progress', async () => {
    const fixture = TestBed.createComponent(CoursesPage);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const view = courseListItemView(course, []);
    expect(root.textContent).toContain(course.title);
    expect(root.textContent).toContain(
      `Модули: ${view.completedModules} / ${view.totalModules} пройдено`,
    );
  });

  it('shows empty state when there are no courses', async () => {
    TestBed.overrideProvider(CourseRepository, {
      useValue: {
        list: vi.fn().mockResolvedValue([]),
        delete: vi.fn(),
      },
    });
    const fixture = TestBed.createComponent(CoursesPage);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Курсов пока нет');
  });

  it('navigates to modules when Пройти is clicked', async () => {
    const fixture = TestBed.createComponent(CoursesPage);
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const proceed = fixture.nativeElement.querySelector(
      '.course-list-card__button--primary',
    ) as HTMLButtonElement;
    proceed.click();
    await fixture.whenStable();
    expect(navigateSpy).toHaveBeenCalledWith(['/courses', course.courseId]);
  });

  it('deletes course after confirm dialog', async () => {
    const fixture = TestBed.createComponent(CoursesPage);
    await fixture.whenStable();
    const courseRepo = TestBed.inject(CourseRepository);
    const deleteBtn = fixture.nativeElement.querySelector(
      '.course-list-card__button--danger',
    ) as HTMLButtonElement;
    deleteBtn.click();
    await fixture.whenStable();
    const confirmBtn = fixture.nativeElement.querySelector(
      '.confirm-dialog__button--primary',
    ) as HTMLButtonElement;
    confirmBtn.click();
    await fixture.whenStable();
    expect(courseRepo.delete).toHaveBeenCalledWith(course.courseId);
  });
});
