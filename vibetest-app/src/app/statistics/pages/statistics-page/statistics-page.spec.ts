import { TestBed, type ComponentFixture } from '@angular/core/testing';

import type { Course } from '../../../courses/course.model';
import { minimalValidCourseJson } from '../../../courses/__fixtures__/course-fixtures';
import { parseCourse } from '../../../courses/parse-course';
import { CourseRepository } from '../../../storage/course-repository';
import { ProgressRepository } from '../../../storage/progress-repository';

import { StatisticsPage } from './statistics-page';

async function whenPageReady(fixture: ComponentFixture<StatisticsPage>): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    if (!text.includes('Загрузка')) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('StatisticsPage did not finish loading');
}

describe('StatisticsPage', () => {
  const course = parseCourse(minimalValidCourseJson());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsPage],
      providers: [
        {
          provide: CourseRepository,
          useValue: {
            list: vi.fn().mockResolvedValue([course as Course]),
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

  it('shows empty state when there are no courses', async () => {
    TestBed.overrideProvider(CourseRepository, {
      useValue: { list: vi.fn().mockResolvedValue([]) },
    });
    const fixture = TestBed.createComponent(StatisticsPage);
    await whenPageReady(fixture);
    expect(fixture.nativeElement.textContent).toContain('Курсов пока нет');
  });

  it('shows module and step aggregates per course', async () => {
    const fixture = TestBed.createComponent(StatisticsPage);
    await whenPageReady(fixture);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain(course.title);
    expect(root.textContent).toContain('Модули:');
    expect(root.textContent).toContain(`Модули: 0 / ${course.modules.length} пройдено`);
    expect(root.textContent).toContain('Шаги:');
    const totalSteps = course.modules.reduce((sum, mod) => sum + mod.steps.length, 0);
    expect(root.textContent).toContain(`Шаги: 0 / ${totalSteps} пройдено`);
  });
});
