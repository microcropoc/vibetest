import { Component, input, output } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import type { PracticeCodeEditorLanguage } from '../code-editor/practice-code-editor-language';
import { PracticeStepShellComponent } from './practice-step-shell';

@Component({
  selector: 'app-code-editor',
  template: '<textarea data-testid="stub-editor" [value]="value()" (input)="onInput($event)" [disabled]="readOnly()"></textarea>',
  standalone: true,
})
class CodeEditorStub {
  readonly value = input('');
  readonly language = input<PracticeCodeEditorLanguage>('plain');
  readonly readOnly = input(false);
  readonly labelledBy = input<string | undefined>(undefined);
  readonly valueChange = output<string>();

  protected onInput(event: Event): void {
    this.valueChange.emit((event.target as HTMLTextAreaElement).value);
  }
}

const javascriptStep = {
  stepId: 'e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a55',
  type: 'javascript' as const,
  title: 'JS practice',
  content: {
    description: 'Write a function',
    starterCode: 'return 0;',
    referenceSolution: 'return 1;',
    setup: '',
    functionName: 'solve',
    timeoutMs: 2000,
    tests: [{ args: [1] }],
  },
};

describe('PracticeStepShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeStepShellComponent],
    })
      .overrideComponent(PracticeStepShellComponent, {
        set: { imports: [CodeEditorStub] },
      })
      .compileComponents();
  });

  it('emits run when Запустить is clicked', async () => {
    const fixture = TestBed.createComponent(PracticeStepShellComponent);
    fixture.componentRef.setInput('step', javascriptStep);
    await fixture.whenStable();
    const run = vi.fn();
    fixture.componentInstance.run.subscribe(run);
    const button = fixture.nativeElement.querySelector('.practice-step-shell__run') as HTMLButtonElement;
    button.click();
    await fixture.whenStable();
    expect(run).toHaveBeenCalledOnce();
  });

  it('shows running status', async () => {
    const fixture = TestBed.createComponent(PracticeStepShellComponent);
    fixture.componentRef.setInput('step', javascriptStep);
    fixture.componentRef.setInput('running', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Выполнение');
    const button = fixture.nativeElement.querySelector('.practice-step-shell__run') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('shows error feedback', async () => {
    const fixture = TestBed.createComponent(PracticeStepShellComponent);
    fixture.componentRef.setInput('step', javascriptStep);
    fixture.componentRef.setInput('feedback', { kind: 'error', message: 'Failed test' });
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Failed test');
  });

  it('does not render referenceSolution or checker', async () => {
    const fixture = TestBed.createComponent(PracticeStepShellComponent);
    const step = {
      ...javascriptStep,
      content: {
        ...javascriptStep.content,
        referenceSolution: 'SECRET_REFERENCE_vt50',
        checker: '(ctx) => SECRET_CHECKER_vt50',
      },
    };
    fixture.componentRef.setInput('step', step);
    await fixture.whenStable();
    const text = fixture.nativeElement.textContent as string;
    expect(text).not.toContain('SECRET_REFERENCE_vt50');
    expect(text).not.toContain('SECRET_CHECKER_vt50');
    expect(text).toContain('Write a function');
  });

  it('emits draftChange from code editor stub', async () => {
    const fixture = TestBed.createComponent(PracticeStepShellComponent);
    fixture.componentRef.setInput('step', javascriptStep);
    await fixture.whenStable();
    const draftChange = vi.fn();
    fixture.componentInstance.draftChange.subscribe(draftChange);
    const textarea = fixture.nativeElement.querySelector('[data-testid="stub-editor"]') as HTMLTextAreaElement;
    textarea.value = 'const x = 1;';
    textarea.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(draftChange).toHaveBeenCalledWith('const x = 1;');
  });
});
