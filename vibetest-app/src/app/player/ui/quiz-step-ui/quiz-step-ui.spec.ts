import { TestBed } from '@angular/core/testing';

import { minimalValidCourseJson } from '../../../courses/__fixtures__/course-fixtures';
import { parseCourse } from '../../../courses/parse-course';

import { QuizStepUiComponent } from './quiz-step-ui';

describe('QuizStepUiComponent', () => {
  const quizStep = parseCourse(minimalValidCourseJson()).modules[0]!.steps[1]!;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizStepUiComponent],
    }).compileComponents();
  });

  it('uses radio inputs for single-answer quiz', async () => {
    const fixture = TestBed.createComponent(QuizStepUiComponent);
    fixture.componentRef.setInput('step', quizStep);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('input[type="radio"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[type="checkbox"]')).toBeNull();
  });

  it('disables submit until a valid selection is made', async () => {
    const fixture = TestBed.createComponent(QuizStepUiComponent);
    fixture.componentRef.setInput('step', quizStep);
    await fixture.whenStable();
    const submit = fixture.nativeElement.querySelector('.quiz-step-ui__submit') as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    fixture.componentRef.setInput('selectedIndices', [0]);
    await fixture.whenStable();
    expect(submit.disabled).toBe(false);
  });

  it('emits submitAnswer when submit is clicked', async () => {
    const fixture = TestBed.createComponent(QuizStepUiComponent);
    fixture.componentRef.setInput('step', quizStep);
    fixture.componentRef.setInput('selectedIndices', [0]);
    await fixture.whenStable();
    const submitAnswer = vi.fn();
    fixture.componentInstance.submitAnswer.subscribe(submitAnswer);
    const submit = fixture.nativeElement.querySelector('.quiz-step-ui__submit') as HTMLButtonElement;
    submit.click();
    await fixture.whenStable();
    expect(submitAnswer).toHaveBeenCalledOnce();
  });

  it('shows failure message when showFailure is true', async () => {
    const fixture = TestBed.createComponent(QuizStepUiComponent);
    fixture.componentRef.setInput('step', quizStep);
    fixture.componentRef.setInput('showFailure', true);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Неверный ответ');
  });
});
