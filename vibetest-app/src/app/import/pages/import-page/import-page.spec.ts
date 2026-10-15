import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';

import { CourseImportService } from '../../../courses/course-import.service';
import type { ImportCourseResult } from '../../../courses/import-types';
import { CourseRepository } from '../../../storage/course-repository';

import { ImportPage } from './import-page';

describe('ImportPage', () => {
  let importCourse: ReturnType<typeof vi.fn>;
  let importModule: ReturnType<typeof vi.fn>;
  let listCourses: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    importCourse = vi.fn();
    importModule = vi.fn();
    listCourses = vi.fn().mockResolvedValue([
      {
        courseId: 'course-1',
        createdAt: '2020-01-01T00:00:00.000Z',
        title: 'Course one',
        description: 'd',
        schemaVersion: 1,
        modules: [],
      },
    ]);
    await TestBed.configureTestingModule({
      imports: [ImportPage],
      providers: [
        provideRouter([{ path: 'import', component: ImportPage }]),
        {
          provide: CourseImportService,
          useValue: { importCourse, importModule },
        },
        {
          provide: CourseRepository,
          useValue: { list: listCourses },
        },
      ],
    }).compileComponents();
  });

  function createFixture(): ComponentFixture<ImportPage> {
    return TestBed.createComponent(ImportPage);
  }

  async function fillTextarea(
    fixture: ComponentFixture<ImportPage>,
    name: string,
    value: string,
  ): Promise<void> {
    const debugEl = fixture.debugElement.query(By.css(`textarea[name="${name}"]`));
    const textarea = debugEl.nativeElement as HTMLTextAreaElement;
    textarea.value = value;
    debugEl.triggerEventHandler('input', { target: textarea });
    await fixture.whenStable();
  }

  async function clickCourseImport(fixture: ComponentFixture<ImportPage>): Promise<void> {
    const section = fixture.nativeElement.querySelector(
      'section[aria-labelledby="import-course-heading"]',
    ) as HTMLElement;
    const apply = section.querySelector('.service-textarea__apply') as HTMLButtonElement;
    apply.click();
    await fixture.whenStable();
  }

  async function clickModuleImport(fixture: ComponentFixture<ImportPage>): Promise<void> {
    const section = fixture.nativeElement.querySelector(
      'section[aria-labelledby="import-module-heading"]',
    ) as HTMLElement;
    const apply = section.querySelector('.service-textarea__apply') as HTMLButtonElement;
    apply.click();
    await fixture.whenStable();
  }

  it('checks regenerate IDs by default', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    const checkbox = fixture.nativeElement.querySelector(
      'input[name="regenerateIds"]',
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('leaves practice validation unchecked by default', async () => {
    const fixture = createFixture();
    await fixture.whenStable();
    const checkbox = fixture.nativeElement.querySelector(
      'input[name="validatePracticeSteps"]',
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
  });

  it('forwards validatePracticeSteps when checkbox is checked', async () => {
    importCourse.mockResolvedValue({
      ok: true,
      courseId: 'new-id',
      action: 'created',
    } satisfies ImportCourseResult);

    const fixture = createFixture();
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const checkbox = fixture.nativeElement.querySelector(
      'input[name="validatePracticeSteps"]',
    ) as HTMLInputElement;
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();

    await fillTextarea(fixture, 'courseJson', '{}');
    await clickCourseImport(fixture);

    expect(importCourse).toHaveBeenCalledWith('{}', {
      regenerateIds: true,
      validatePracticeSteps: true,
      confirmReplace: undefined,
    });
  });

  it('shows validation issues from the service', async () => {
    importCourse.mockResolvedValue({
      ok: false,
      stage: 'json',
      issues: [{ path: 'json', message: 'Unexpected token' }],
    } satisfies ImportCourseResult);

    const fixture = createFixture();
    await fixture.whenStable();
    await fillTextarea(fixture, 'courseJson', '{');
    await clickCourseImport(fixture);

    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Разбор JSON');
    expect(root.textContent).toContain('json: Unexpected token');
    expect(importCourse).toHaveBeenCalledWith('{', {
      regenerateIds: true,
      validatePracticeSteps: false,
      confirmReplace: undefined,
    });
  });

  it('opens replace dialog when course id already exists', async () => {
    importCourse.mockResolvedValue({
      ok: false,
      stage: 'replace-required',
      courseId: 'course-1',
    } satisfies ImportCourseResult);

    const fixture = createFixture();
    await fixture.whenStable();
    const checkbox = fixture.nativeElement.querySelector(
      'input[name="regenerateIds"]',
    ) as HTMLInputElement;
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    await fixture.whenStable();

    await fillTextarea(fixture, 'courseJson', '{}');
    await clickCourseImport(fixture);

    expect(fixture.nativeElement.textContent).toContain('Заменить курс');
    expect(fixture.nativeElement.textContent).toContain('course-1');
  });

  it('retries import with confirmReplace after dialog confirm', async () => {
    importCourse
      .mockResolvedValueOnce({
        ok: false,
        stage: 'replace-required',
        courseId: 'course-1',
      })
      .mockResolvedValueOnce({
        ok: true,
        courseId: 'course-1',
        action: 'replaced',
      } satisfies ImportCourseResult);

    const fixture = createFixture();
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const checkbox = fixture.nativeElement.querySelector(
      'input[name="regenerateIds"]',
    ) as HTMLInputElement;
    checkbox.checked = false;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));

    await fillTextarea(fixture, 'courseJson', '{"courseId":"course-1"}');
    await clickCourseImport(fixture);

    const confirm = fixture.nativeElement.querySelector(
      '.confirm-dialog__button--primary',
    ) as HTMLButtonElement;
    confirm.click();
    await fixture.whenStable();

    expect(importCourse).toHaveBeenLastCalledWith('{"courseId":"course-1"}', {
      regenerateIds: false,
      validatePracticeSteps: false,
      confirmReplace: true,
    });
  });

  it('navigates to course on successful import', async () => {
    importCourse.mockResolvedValue({
      ok: true,
      courseId: 'new-id',
      action: 'created',
    } satisfies ImportCourseResult);

    const fixture = createFixture();
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await fillTextarea(fixture, 'courseJson', '{}');
    await clickCourseImport(fixture);

    expect(navigateSpy).toHaveBeenCalledWith(['/courses', 'new-id']);
  });

  it('shows message when clipboard access is denied', async () => {
    const readText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { readText },
    });

    const fixture = createFixture();
    await fixture.whenStable();
    const section = fixture.nativeElement.querySelector(
      'section[aria-labelledby="import-course-heading"]',
    ) as HTMLElement;
    const button = [...section.querySelectorAll('button')].find((element) =>
      element.textContent?.includes('Вставить'),
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Нет доступа к буферу обмена');
  });

  it('calls importModule with selected course', async () => {
    importModule.mockResolvedValue({
      ok: true,
      courseId: 'course-1',
      moduleId: 'module-1',
      action: 'appended',
    });

    const fixture = createFixture();
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await fillTextarea(fixture, 'moduleJson', '{"schemaVersion":1}');
    await clickModuleImport(fixture);

    expect(importModule).toHaveBeenCalledWith('{"schemaVersion":1}', {
      courseId: 'course-1',
      validatePracticeSteps: false,
    });
  });
});
