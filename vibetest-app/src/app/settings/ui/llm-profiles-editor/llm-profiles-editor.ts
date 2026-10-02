import { Component, computed, input, output, signal } from '@angular/core';

import type { LlmProfile } from '../../llm-profile.model';
import {
  emptyLlmProfileFieldsValue,
  llmProfileFieldsError,
  llmProfileFieldsFromProfile,
  type LlmProfileFieldsValue,
} from '../../llm-profile-fields-value';
import { maskApiKey } from '../../mask-api-key';
import { createLlmProfileId, profileFromFields } from '../../upsert-llm-profile';
import { LlmProfileFieldsComponent } from '../llm-profile-fields/llm-profile-fields';

const NEW_PROFILE = 'new';

@Component({
  selector: 'app-llm-profiles-editor',
  imports: [LlmProfileFieldsComponent],
  templateUrl: './llm-profiles-editor.html',
  styleUrl: './llm-profiles-editor.scss',
})
export class LlmProfilesEditorComponent {
  readonly profiles = input.required<readonly LlmProfile[]>();
  readonly loading = input(false);
  readonly statusMessage = input<string | null>(null);

  readonly profileSave = output<LlmProfile>();
  readonly profileDelete = output<LlmProfile>();

  protected readonly editingId = signal<string | null>(null);
  protected readonly formValue = signal<LlmProfileFieldsValue>(emptyLlmProfileFieldsValue());
  protected readonly formError = signal<string | null>(null);
  protected readonly maskApiKey = maskApiKey;

  /** Emitted profile awaiting persistence; the form stays open until it shows up in `profiles`. */
  private readonly pendingSave = signal<LlmProfile | null>(null);

  protected readonly formOpen = computed((): boolean => {
    if (this.editingId() === null) {
      return false;
    }
    const pending = this.pendingSave();
    return pending === null || !this.profiles().some((p) => isSameLlmProfile(p, pending));
  });

  protected onFormValueChange(value: LlmProfileFieldsValue): void {
    this.formValue.set(value);
    this.formError.set(null);
  }

  protected onStartAdd(): void {
    this.openForm(NEW_PROFILE, emptyLlmProfileFieldsValue());
  }

  protected onStartEdit(profile: LlmProfile): void {
    this.openForm(profile.id, llmProfileFieldsFromProfile(profile));
  }

  protected onCancelEdit(): void {
    this.editingId.set(null);
    this.pendingSave.set(null);
    this.formError.set(null);
  }

  protected onSave(): void {
    const fields = this.formValue();
    const error = llmProfileFieldsError(fields);
    if (error !== null) {
      this.formError.set(error);
      return;
    }

    const editingId = this.editingId();
    const id = editingId === null || editingId === NEW_PROFILE ? createLlmProfileId() : editingId;
    const profile = profileFromFields(fields, id);
    if (editingId === NEW_PROFILE) {
      this.editingId.set(profile.id);
    }
    this.pendingSave.set(profile);
    this.profileSave.emit(profile);
  }

  protected onDelete(profile: LlmProfile): void {
    if (this.editingId() === profile.id) {
      this.onCancelEdit();
    }
    this.profileDelete.emit(profile);
  }

  private openForm(id: string, value: LlmProfileFieldsValue): void {
    this.editingId.set(id);
    this.pendingSave.set(null);
    this.formValue.set(value);
    this.formError.set(null);
  }
}

function isSameLlmProfile(a: LlmProfile, b: LlmProfile): boolean {
  return (
    a.id === b.id &&
    a.label === b.label &&
    a.baseUrl === b.baseUrl &&
    a.apiKey === b.apiKey &&
    a.model === b.model &&
    a.structuredOutput === b.structuredOutput &&
    a.contextLength === b.contextLength
  );
}
