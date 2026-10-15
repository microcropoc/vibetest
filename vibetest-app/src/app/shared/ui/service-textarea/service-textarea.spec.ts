import { TestBed, type ComponentFixture } from '@angular/core/testing';

import { ServiceTextarea } from './service-textarea';

describe('ServiceTextarea', () => {
  let fixture: ComponentFixture<ServiceTextarea>;
  let component: ServiceTextarea;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceTextarea],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceTextarea);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('value', '');
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function textarea(): HTMLTextAreaElement {
    return fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
  }

  it('emits valueChange on input', async () => {
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    textarea().value = 'hello';
    textarea().dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledWith('hello');
  });

  it('disables apply when value is empty', async () => {
    fixture.componentRef.setInput('applyLabel', 'Применить');
    await fixture.whenStable();

    const apply = fixture.nativeElement.querySelector(
      '.service-textarea__apply',
    ) as HTMLButtonElement;
    expect(apply.disabled).toBe(true);
  });

  it('emits apply when value is non-empty', async () => {
    fixture.componentRef.setInput('value', 'data');
    fixture.componentRef.setInput('applyLabel', 'Применить');
    await fixture.whenStable();

    const spy = vi.fn();
    component.apply.subscribe(spy);
    const apply = fixture.nativeElement.querySelector(
      '.service-textarea__apply',
    ) as HTMLButtonElement;
    apply.click();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalled();
  });

  it('pastes clipboard text into valueChange', async () => {
    const readText = vi.fn().mockResolvedValue('from clipboard');
    vi.stubGlobal('navigator', { clipboard: { readText } });
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    const paste = [...fixture.nativeElement.querySelectorAll('button')].find(
      (button: HTMLButtonElement) => button.textContent?.includes('Вставить'),
    ) as HTMLButtonElement;
    paste.click();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledWith('from clipboard');
  });

  it('shows status when clipboard read is denied', async () => {
    const readText = vi.fn().mockRejectedValue(new Error('denied'));
    vi.stubGlobal('navigator', { clipboard: { readText } });

    const paste = [...fixture.nativeElement.querySelectorAll('button')].find(
      (button: HTMLButtonElement) => button.textContent?.includes('Вставить'),
    ) as HTMLButtonElement;
    paste.click();
    await fixture.whenStable();

    const status = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(status.textContent).toContain('Вставьте текст вручную');
    expect(status.classList.contains('service-textarea__status--error')).toBe(true);
  });

  it('uses custom pasteFailedMessage when provided', async () => {
    fixture.componentRef.setInput('pasteFailedMessage', 'Вставьте JSON вручную.');
    await fixture.whenStable();
    const readText = vi.fn().mockRejectedValue(new Error('denied'));
    vi.stubGlobal('navigator', { clipboard: { readText } });

    const paste = [...fixture.nativeElement.querySelectorAll('button')].find(
      (button: HTMLButtonElement) => button.textContent?.includes('Вставить'),
    ) as HTMLButtonElement;
    paste.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Вставьте JSON вручную.');
  });

  it('clears value on clear click', async () => {
    fixture.componentRef.setInput('value', 'x');
    await fixture.whenStable();
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    const clear = [...fixture.nativeElement.querySelectorAll('button')].find(
      (button: HTMLButtonElement) => button.textContent?.includes('Очистить'),
    ) as HTMLButtonElement;
    clear.click();
    await fixture.whenStable();

    expect(spy).toHaveBeenCalledWith('');
  });

  it('copies field value and shows copied status', async () => {
    fixture.componentRef.setInput('value', 'copy me');
    await fixture.whenStable();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    const copy = [...fixture.nativeElement.querySelectorAll('button')].find(
      (button: HTMLButtonElement) => button.textContent?.includes('Копировать'),
    ) as HTMLButtonElement;
    copy.click();
    await fixture.whenStable();

    expect(writeText).toHaveBeenCalledWith('copy me');
    expect(fixture.nativeElement.textContent).toContain('Скопировано');
  });
});
