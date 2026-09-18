import { TestBed } from '@angular/core/testing';

import { PracticeStepShellComponent } from './practice-step-shell';

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
    }).compileComponents();
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
});
