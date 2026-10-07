import { signal } from '@angular/core';
import { DeferBlockState, TestBed } from '@angular/core/testing';

import type { Step } from '../../../courses/course.model';
import type { PracticeFeedback } from '../../practice-step-view';
import { PlayerOrchestratorService } from '../../player-orchestrator.service';

import { PlayerShellComponent } from './player-shell';

const regexStep: Step = {
  stepId: 'f6eebc99-9c0b-4ef8-bb6d-6bb9bd380a77',
  type: 'regex',
  title: 'Digits',
  content: {
    description: 'Digits only',
    starterCode: '',
    referenceSolution: '^\\d+$',
    timeoutMs: 1000,
    tests: [{ input: '123' }],
  },
};

const successFeedback: PracticeFeedback = {
  kind: 'success',
  message: 'Все проверки пройдены.',
  tests: { passed: 1, total: 1 },
};

describe('PlayerShellComponent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('catches a progress save failure after a run and keeps the run feedback', async () => {
    const saveError = new Error('QuotaExceededError');
    const practiceFeedback = signal<PracticeFeedback | null>(null);
    const runPractice = vi.fn(async () => {
      practiceFeedback.set(successFeedback);
      throw saveError;
    });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await TestBed.configureTestingModule({
      imports: [PlayerShellComponent],
      providers: [
        {
          provide: PlayerOrchestratorService,
          useValue: {
            practiceRunning: signal(false),
            practiceFeedback,
            runPractice,
            setPracticeDraft: vi.fn(async () => undefined),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PlayerShellComponent);
    fixture.componentRef.setInput('step', regexStep);
    await fixture.whenStable();
    for (const block of await fixture.getDeferBlocks()) {
      await block.render(DeferBlockState.Complete);
    }
    await fixture.whenStable();

    const runButton = fixture.nativeElement.querySelector(
      '.practice-step-shell__run',
    ) as HTMLButtonElement | null;
    expect(runButton).not.toBeNull();
    runButton?.click();
    await fixture.whenStable();
    await Promise.resolve();

    expect(runPractice).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith('Practice progress save failed', saveError);
    expect(practiceFeedback()).toEqual(successFeedback);
  });
});
