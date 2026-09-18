import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import type { Course } from '../../../courses/course.model';
import {
  FIXTURE_COURSE_ID,
  FIXTURE_MODULE_ID,
  minimalValidCourseJson,
} from '../../../courses/__fixtures__/course-fixtures';
import { parseCourse } from '../../../courses/parse-course';
import { PlayerOrchestratorService } from '../../player-orchestrator.service';
import { CourseRepository } from '../../../storage/course-repository';
import { ProgressRepository } from '../../../storage/progress-repository';

import { PlayerPage } from './player-page';

async function whenPageReady(fixture: ComponentFixture<PlayerPage>): Promise<void> {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    if (!text.includes('Загрузка')) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  throw new Error('PlayerPage did not finish loading');
}

describe('PlayerPage', () => {
  const course = parseCourse(minimalValidCourseJson());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerPage],
      providers: [
        provideRouter([]),
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
            put: vi.fn(),
          },
        },
      ],
    }).compileComponents();
  });

  it('uses route-scoped orchestrator and renders player shell', async () => {
    const fixture = TestBed.createComponent(PlayerPage);
    fixture.componentRef.setInput('courseId', FIXTURE_COURSE_ID);
    fixture.componentRef.setInput('moduleId', FIXTURE_MODULE_ID);
    await whenPageReady(fixture);
    const orchestrator = fixture.debugElement.injector.get(PlayerOrchestratorService);
    const root = fixture.nativeElement as HTMLElement;
    expect(orchestrator.courseTitle()).toBe(course.title);
    expect(root.textContent).toContain(course.modules[0]!.title);
    expect(root.querySelector('.step-indicator-bar')).toBeTruthy();
    expect(root.querySelector('.player-nav')).toBeTruthy();
  });
});
