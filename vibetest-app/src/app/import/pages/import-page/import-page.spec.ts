import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { CourseImportService } from '../../../courses/course-import.service';
import type { ImportCourseResult } from '../../../courses/import-types';

import { ImportPage } from './import-page';

describe('ImportPage', () => {
  let importCourse: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    importCourse = vi.fn();
    await TestBed.configureTestingModule({
      imports: [ImportPage],
      providers: [
        provideRouter([{ path: 'import', component: ImportPage }]),
        {
          provide: CourseImportService,
          useValue: { importCourse },
        },
      ],
    }).compileComponents();
  });

  function createFixture(): ComponentFixture<ImportPage> {
    return TestBed.createComponent(ImportPage);
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

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = '{}';
    textarea.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

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
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = '{';
    textarea.dispatchEvent(new Event('input'));
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

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

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = '{}';
    textarea.dispatchEvent(new Event('input'));
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

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

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = '{"courseId":"course-1"}';
    textarea.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

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

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = '{}';
    textarea.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

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
    const button = fixture.nativeElement.querySelector(
      'button.import-page__button',
    ) as HTMLButtonElement;
    button.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Нет доступа к буферу обмена');
  });
});
