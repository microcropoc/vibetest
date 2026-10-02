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

  it('renders question and options as markdown', async () => {
    const fixture = TestBed.createComponent(QuizStepUiComponent);
    if (quizStep.type !== 'quiz') {
      throw new Error('expected quiz step fixture');
    }
    const step = {
      ...quizStep,
      content: {
        ...quizStep.content,
        question: 'Pick **one**',
        options: ['`x => x * 2`', 'plain'],
      },
    };
    fixture.componentRef.setInput('step', step);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.quiz-step-ui__question strong')?.textContent).toBe('one');
    expect(root.querySelector('.quiz-step-ui__label code')?.textContent).toContain('x => x * 2');
  });

  it('parses raw HTML in an option as markup (authors should use inline code)', async () => {
    const fixture = TestBed.createComponent(QuizStepUiComponent);
    if (quizStep.type !== 'quiz') {
      throw new Error('expected quiz step fixture');
    }
    const step = {
      ...quizStep,
      content: {
        ...quizStep.content,
        options: ['<em>emphasis</em>', 'plain'],
      },
    };
    fixture.componentRef.setInput('step', step);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.quiz-step-ui__label em')?.textContent).toBe('emphasis');
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

  it('shows success message when showSuccess is true', async () => {
    const fixture = TestBed.createComponent(QuizStepUiComponent);
    fixture.componentRef.setInput('step', quizStep);
    fixture.componentRef.setInput('showSuccess', true);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.quiz-step-ui__success[role="status"]')?.textContent).toContain(
      'Верно! Шаг пройден.',
    );
  });

  it('shows only the failure when both flags are set', async () => {
    const fixture = TestBed.createComponent(QuizStepUiComponent);
    fixture.componentRef.setInput('step', quizStep);
    fixture.componentRef.setInput('showFailure', true);
    fixture.componentRef.setInput('showSuccess', true);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.quiz-step-ui__error')).toBeTruthy();
    expect(root.querySelector('.quiz-step-ui__success')).toBeNull();
  });
});
