import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { ManualStagePanel } from './manual-stage-panel';

type Fixture = ComponentFixture<ManualStagePanel>;

function root(fixture: Fixture): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function copyButton(fixture: Fixture): HTMLButtonElement {
  return root(fixture).querySelector('.manual-stage-panel__copy') as HTMLButtonElement;
}

function acceptButton(fixture: Fixture): HTMLButtonElement {
  return root(fixture).querySelector('.manual-stage-panel__accept') as HTMLButtonElement;
}

describe('ManualStagePanel', () => {
  let fixture: Fixture;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ManualStagePanel] }).compileComponents();
    fixture = TestBed.createComponent(ManualStagePanel);
    fixture.componentRef.setInput('label', 'Курс и модуль 1: «Основы»');
    fixture.componentRef.setInput('answer', '');
    await fixture.whenStable();
  });

  it('shows the stage and disables saving until an answer is pasted', () => {
    expect(root(fixture).textContent).toContain('Курс и модуль 1: «Основы»');
    expect(copyButton(fixture).textContent?.trim()).toBe('Копировать промт');
    expect(acceptButton(fixture).disabled).toBe(true);
  });

  it('emits copy, answer changes and accept', async () => {
    const events: string[] = [];
    fixture.componentInstance.copyPrompt.subscribe(() => events.push('copy'));
    fixture.componentInstance.answerChange.subscribe((value) => events.push(`answer:${value}`));
    fixture.componentInstance.accept.subscribe(() => events.push('accept'));

    copyButton(fixture).click();
    const textarea = root(fixture).querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = '{}';
    textarea.dispatchEvent(new Event('input'));
    fixture.componentRef.setInput('answer', '{}');
    await fixture.whenStable();
    acceptButton(fixture).click();

    expect(events).toEqual(['copy', 'answer:{}', 'accept']);
  });

  it('lists problems and offers the prompt with fixes', async () => {
    fixture.componentRef.setInput('issues', [{ path: 'modules', message: 'Нужен ровно один модуль' }]);
    await fixture.whenStable();

    expect(root(fixture).textContent).toContain('Ответ не прошёл проверку');
    expect(root(fixture).textContent).toContain('Нужен ровно один модуль');
    expect(copyButton(fixture).textContent?.trim()).toBe('Копировать промт с исправлениями');
  });

  it('shows an error and locks the panel while busy', async () => {
    fixture.componentRef.setInput('answer', '{}');
    fixture.componentRef.setInput('error', 'Курс не найден');
    fixture.componentRef.setInput('busy', true);
    await fixture.whenStable();

    expect(root(fixture).querySelector('[role="alert"]')?.textContent).toContain('Курс не найден');
    expect(acceptButton(fixture).disabled).toBe(true);
    expect(copyButton(fixture).disabled).toBe(true);
  });

  it('reports the copy result', async () => {
    fixture.componentRef.setInput('copyResult', 'copied');
    await fixture.whenStable();
    expect(root(fixture).textContent).toContain('Скопировано');
  });
});
