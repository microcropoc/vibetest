import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import type { Course } from '../../course.model';
import { FIXTURE_COURSE_ID, minimalValidCourseJson } from '../../__fixtures__/course-fixtures';
import { moduleListItemView } from '../../module-list-item-view';
import { parseCourse } from '../../parse-course';
import { CourseRepository } from '../../../storage/course-repository';
import { ProgressRepository } from '../../../storage/progress-repository';

import { CourseModulesPage } from './course-modules-page';

async function whenPageReady(fixture: ComponentFixture<CourseModulesPage>): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    if (!text.includes('Загрузка')) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('CourseModulesPage did not finish loading');
}

describe('CourseModulesPage', () => {
  const course = parseCourse(minimalValidCourseJson());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseModulesPage],
      providers: [
        provideRouter([
          { path: 'courses', component: CourseModulesPage },
          {
            path: 'courses/:courseId/modules/:moduleId',
            component: CourseModulesPage,
          },
        ]),
        {
          provide: CourseRepository,
          useValue: {
            get: vi.fn().mockImplementation(async (id: string) =>
              id === FIXTURE_COURSE_ID ? (course as Course) : undefined,
            ),
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

  it('shows module cards with step progress', async () => {
    const fixture = TestBed.createComponent(CourseModulesPage);
    fixture.componentRef.setInput('courseId', FIXTURE_COURSE_ID);
    await whenPageReady(fixture);
    const root = fixture.nativeElement as HTMLElement;
    const module = course.modules[0]!;
    const view = moduleListItemView(module, () => undefined);
    expect(root.textContent).toContain(course.title);
    expect(root.textContent).toContain(module.title);
    expect(root.textContent).toContain(
      `Шаги: ${view.completedSteps} / ${view.totalSteps} пройдено`,
    );
  });

  it('navigates to courses on exit', async () => {
    const fixture = TestBed.createComponent(CourseModulesPage);
    fixture.componentRef.setInput('courseId', FIXTURE_COURSE_ID);
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const exit = fixture.nativeElement.querySelector('.course-modules-page__exit') as HTMLButtonElement;
    exit.click();
    await fixture.whenStable();
    expect(navigateSpy).toHaveBeenCalledWith(['/courses']);
  });

  it('navigates to player route when Пройти is clicked', async () => {
    const fixture = TestBed.createComponent(CourseModulesPage);
    fixture.componentRef.setInput('courseId', FIXTURE_COURSE_ID);
    await whenPageReady(fixture);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const moduleId = course.modules[0]!.moduleId;
    const proceed = fixture.nativeElement.querySelector('.module-list-card__button') as HTMLButtonElement;
    proceed.click();
    await fixture.whenStable();
    expect(navigateSpy).toHaveBeenCalledWith(['/courses', FIXTURE_COURSE_ID, 'modules', moduleId]);
  });

  it('shows not found when course is missing', async () => {
    const fixture = TestBed.createComponent(CourseModulesPage);
    fixture.componentRef.setInput('courseId', 'missing-course');
    await whenPageReady(fixture);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Курс не найден');
  });
});
