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
    expect(root.textContent).not.toContain('Повторить');
  });

  it('scrolls to step start when the current step changes', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(PlayerPage);
    fixture.componentRef.setInput('courseId', FIXTURE_COURSE_ID);
    fixture.componentRef.setInput('moduleId', FIXTURE_MODULE_ID);
    await whenPageReady(fixture);
    scrollTo.mockClear();
    const orchestrator = fixture.debugElement.injector.get(PlayerOrchestratorService);
    orchestrator.selectStep(1);
    await fixture.whenStable();
    expect(scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0, left: 0 }),
    );
    scrollTo.mockRestore();
  });

  it('does not scroll when the same step draft changes', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(PlayerPage);
    fixture.componentRef.setInput('courseId', FIXTURE_COURSE_ID);
    fixture.componentRef.setInput('moduleId', FIXTURE_MODULE_ID);
    await whenPageReady(fixture);
    const orchestrator = fixture.debugElement.injector.get(PlayerOrchestratorService);
    orchestrator.selectStep(1);
    await fixture.whenStable();
    scrollTo.mockClear();
    await orchestrator.dispatch({ kind: 'setSelection', selectedIndices: [0] });
    await fixture.whenStable();
    expect(scrollTo).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });

  it('does not scroll when steps are replaced without changing step id', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(PlayerPage);
    fixture.componentRef.setInput('courseId', FIXTURE_COURSE_ID);
    fixture.componentRef.setInput('moduleId', FIXTURE_MODULE_ID);
    await whenPageReady(fixture);
    scrollTo.mockClear();
    const orchestrator = fixture.debugElement.injector.get(PlayerOrchestratorService);
    orchestrator.steps.set(orchestrator.steps().map((step) => ({ ...step })));
    await fixture.whenStable();
    expect(scrollTo).not.toHaveBeenCalled();
    scrollTo.mockRestore();
  });
});
