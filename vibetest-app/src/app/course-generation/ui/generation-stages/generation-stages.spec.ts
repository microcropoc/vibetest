import { TestBed } from '@angular/core/testing';

import { outlineWithModules } from '../../__fixtures__/outline-fixtures';
import type { GenerationStageView } from '../../generation-stage-view';

import { GenerationStages } from './generation-stages';

const STAGES: readonly GenerationStageView[] = [
  { id: 'outline', label: 'План курса', status: 'done', attemptLabel: null },
  {
    id: 'module-0',
    label: 'Курс и модуль 1: «Основы»',
    status: 'running',
    attemptLabel: 'попытка 2 из 3',
  },
];

describe('GenerationStages', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [GenerationStages] }).compileComponents();
  });

  it('renders stages with status and attempt', async () => {
    const fixture = TestBed.createComponent(GenerationStages);
    fixture.componentRef.setInput('stages', STAGES);
    await fixture.whenStable();

    const items = (fixture.nativeElement as HTMLElement).querySelectorAll(
      '.generation-stages__item',
    );
    expect(items).toHaveLength(2);
    expect(items[0]?.textContent).toContain('готово');
    expect(items[1]?.textContent).toContain('выполняется');
    expect(items[1]?.textContent).toContain('попытка 2 из 3');
    expect(items[1]?.classList).toContain('generation-stages__item--running');
  });

  it('shows the outline modules and steps when provided', async () => {
    const fixture = TestBed.createComponent(GenerationStages);
    fixture.componentRef.setInput('stages', STAGES);
    fixture.componentRef.setInput('outline', outlineWithModules('Основы', 'Группы'));
    await fixture.whenStable();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('План курса: «Регулярные выражения»');
    expect(text).toContain('Группы');
    expect(text).toContain('Основы: схема');
  });
});
