import { TestBed, type ComponentFixture } from '@angular/core/testing';

import type { LlmProfile } from '../../llm-profile.model';

import { LlmProfilesEditorComponent } from './llm-profiles-editor';

const PROFILE: LlmProfile = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  label: 'Local',
  baseUrl: 'http://localhost:1234/v1',
  apiKey: 'sk-secret-1234',
  model: 'model-1',
  structuredOutput: true,
};

type Fixture = ComponentFixture<LlmProfilesEditorComponent>;

function root(fixture: Fixture): HTMLElement {
  return fixture.nativeElement as HTMLElement;
}

function buttonByText(fixture: Fixture, text: string): HTMLButtonElement {
  const button = Array.from(root(fixture).querySelectorAll('button')).find(
    (b) => b.textContent?.trim() === text,
  );
  if (!button) {
    throw new Error(`Button "${text}" not found`);
  }
  return button;
}

async function fillFields(fixture: Fixture, values: readonly string[]): Promise<void> {
  const inputs = root(fixture).querySelectorAll(
    '.llm-profile-fields__input',
  ) as NodeListOf<HTMLInputElement>;
  for (const [index, value] of values.entries()) {
    inputs[index]!.value = value;
    inputs[index]!.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  }
}

describe('LlmProfilesEditorComponent', () => {
  let fixture: Fixture;
  let saved: LlmProfile[];
  let deleted: LlmProfile[];

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [LlmProfilesEditorComponent] });
    fixture = TestBed.createComponent(LlmProfilesEditorComponent);
    fixture.componentRef.setInput('profiles', [PROFILE]);
    saved = [];
    deleted = [];
    fixture.componentInstance.profileSave.subscribe((p) => saved.push(p));
    fixture.componentInstance.profileDelete.subscribe((p) => deleted.push(p));
    await fixture.whenStable();
  });

  it('lists profiles with a masked key', () => {
    const text = root(fixture).textContent ?? '';
    expect(text).toContain('Local');
    expect(text).toContain('1234');
    expect(text).not.toContain('sk-secret');
    expect(text).toContain('json_schema');
  });

  it('emits a new profile from the add form', async () => {
    buttonByText(fixture, 'Добавить профиль').click();
    await fixture.whenStable();
    await fillFields(fixture, ['Remote', 'http://remote:1234/v1', 'key', 'model-2']);
    buttonByText(fixture, 'Сохранить').click();
    await fixture.whenStable();

    expect(saved).toHaveLength(1);
    expect(saved[0]).toEqual(
      expect.objectContaining({ label: 'Remote', baseUrl: 'http://remote:1234/v1', model: 'model-2' }),
    );
    expect(saved[0]?.id).not.toBe(PROFILE.id);

    fixture.componentRef.setInput('profiles', [PROFILE, saved[0]!]);
    await fixture.whenStable();
    expect(root(fixture).querySelector('.llm-profile-fields__input')).toBeNull();
  });

  it('keeps the form and its values until the parent confirms the save', async () => {
    buttonByText(fixture, 'Добавить профиль').click();
    await fixture.whenStable();
    await fillFields(fixture, ['Remote', 'http://remote:1234/v1', 'key', 'model-2']);
    buttonByText(fixture, 'Сохранить').click();
    fixture.componentRef.setInput('statusMessage', 'Не удалось сохранить профили.');
    await fixture.whenStable();

    const inputs = root(fixture).querySelectorAll(
      '.llm-profile-fields__input',
    ) as NodeListOf<HTMLInputElement>;
    expect(inputs[0]?.value).toBe('Remote');
    expect(root(fixture).textContent).toContain('Не удалось сохранить профили.');

    buttonByText(fixture, 'Сохранить').click();
    await fixture.whenStable();
    expect(saved).toHaveLength(2);
    expect(saved[1]?.id).toBe(saved[0]?.id);
  });

  it('emits the edited profile with the same id', async () => {
    buttonByText(fixture, 'Изменить').click();
    await fixture.whenStable();
    const keyInput = root(fixture).querySelectorAll('.llm-profile-fields__input')[2] as HTMLInputElement;
    expect(keyInput.value).toBe(PROFILE.apiKey);

    await fillFields(fixture, ['Local renamed']);
    buttonByText(fixture, 'Сохранить').click();
    await fixture.whenStable();

    expect(saved).toEqual([{ ...PROFILE, label: 'Local renamed' }]);
  });

  it('emits delete for the chosen profile', async () => {
    buttonByText(fixture, 'Удалить').click();
    await fixture.whenStable();

    expect(deleted).toEqual([PROFILE]);
  });

  it('shows a validation error and does not emit for invalid fields', async () => {
    buttonByText(fixture, 'Добавить профиль').click();
    await fixture.whenStable();
    await fillFields(fixture, ['x'.repeat(121), 'http://h/v1', '', 'm']);
    buttonByText(fixture, 'Сохранить').click();
    await fixture.whenStable();

    expect(saved).toHaveLength(0);
    expect(root(fixture).textContent).toContain('Поле «Название» слишком длинное.');
  });
});
