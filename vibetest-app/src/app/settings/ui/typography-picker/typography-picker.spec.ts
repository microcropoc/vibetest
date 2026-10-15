import { TestBed } from '@angular/core/testing';

import { DEFAULT_CODE_TYPOGRAPHY, DEFAULT_UI_TYPOGRAPHY } from '../../typography.model';
import { TypographyPicker } from './typography-picker';

describe('TypographyPicker', () => {
  it('shows the profile passed in', async () => {
    await TestBed.configureTestingModule({
      imports: [TypographyPicker],
    }).compileComponents();
    const fixture = TestBed.createComponent(TypographyPicker);
    fixture.componentRef.setInput('ui', { family: 'serif', size: 'l' });
    fixture.componentRef.setInput('code', DEFAULT_CODE_TYPOGRAPHY);
    await fixture.whenStable();

    const family = fixture.nativeElement.querySelector(
      'select[name="typography-ui-family"]',
    ) as HTMLSelectElement;
    const size = fixture.nativeElement.querySelector(
      'select[name="typography-ui-size"]',
    ) as HTMLSelectElement;
    expect(family.value).toBe('serif');
    expect(size.value).toBe('l');
  });

  it('keeps the new family when the size changes before the parent updates', async () => {
    await TestBed.configureTestingModule({
      imports: [TypographyPicker],
    }).compileComponents();
    const fixture = TestBed.createComponent(TypographyPicker);
    fixture.componentRef.setInput('ui', DEFAULT_UI_TYPOGRAPHY);
    fixture.componentRef.setInput('code', DEFAULT_CODE_TYPOGRAPHY);
    await fixture.whenStable();

    const uiChange = vi.fn();
    const reset = vi.fn();
    fixture.componentInstance.uiChange.subscribe(uiChange);
    fixture.componentInstance.resetTypography.subscribe(reset);

    const family = fixture.nativeElement.querySelector(
      'select[name="typography-ui-family"]',
    ) as HTMLSelectElement;
    family.value = 'serif';
    family.dispatchEvent(new Event('change'));
    expect(uiChange).toHaveBeenCalledWith({ family: 'serif', size: 'm' });

    const size = fixture.nativeElement.querySelector(
      'select[name="typography-ui-size"]',
    ) as HTMLSelectElement;
    size.value = 'l';
    size.dispatchEvent(new Event('change'));
    expect(uiChange).toHaveBeenLastCalledWith({ family: 'serif', size: 'l' });

    const button = fixture.nativeElement.querySelector(
      '.typography-picker__reset',
    ) as HTMLButtonElement;
    button.click();
    expect(reset).toHaveBeenCalledOnce();
  });
});
