import { Component, computed, input, output, signal } from '@angular/core';

import {
  copyTextToClipboard,
  type CopyTextToClipboardResult,
} from '../../clipboard/copy-text-to-clipboard';
import {
  CLIPBOARD_READ_FAILED_MESSAGE,
  CLIPBOARD_READ_UNAVAILABLE_MESSAGE,
  readTextFromClipboard,
} from '../../clipboard/read-text-from-clipboard';

@Component({
  imports: [],
  selector: 'app-service-textarea',
  styleUrl: './service-textarea.scss',
  templateUrl: './service-textarea.html',
})
export class ServiceTextarea {
  readonly label = input<string | null>(null);
  readonly value = input.required<string>();
  readonly disabled = input(false);
  readonly busy = input(false);
  readonly rows = input(6);
  readonly monospace = input(false);
  readonly name = input<string | null>(null);
  readonly placeholder = input<string | null>(null);
  readonly applyLabel = input<string | null>(null);
  readonly applyBusyLabel = input<string | null>(null);
  readonly applyDisabled = input(false);
  readonly confirmClear = input(false);
  readonly showCopy = input(true);
  readonly showPaste = input(true);
  readonly showClear = input(true);
  readonly ariaLabel = input<string | null>(null);
  readonly pasteUnavailableMessage = input(CLIPBOARD_READ_UNAVAILABLE_MESSAGE);
  readonly pasteFailedMessage = input(CLIPBOARD_READ_FAILED_MESSAGE);

  readonly valueChange = output<string>();
  readonly apply = output<void>();

  protected readonly clipboardMessage = signal<string | null>(null);
  protected readonly clipboardMessageIsError = signal(false);
  protected readonly copyResult = signal<CopyTextToClipboardResult | null>(null);

  protected readonly hasValue = computed(() => this.value().trim().length > 0);
  protected readonly fieldDisabled = computed(() => this.disabled() || this.busy());
  protected readonly applyButtonDisabled = computed(
    () =>
      this.fieldDisabled() ||
      this.applyDisabled() ||
      !this.hasValue(),
  );
  protected readonly applyButtonText = computed((): string => {
    if (this.busy() && this.applyBusyLabel()) {
      return this.applyBusyLabel()!;
    }
    return this.applyLabel() ?? '';
  });
  protected readonly showApplyButton = computed(() => this.applyLabel() !== null);

  protected onInput(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) {
      return;
    }
    this.valueChange.emit(target.value);
    this.clipboardMessage.set(null);
    this.clipboardMessageIsError.set(false);
    this.copyResult.set(null);
  }

  protected async onCopy(): Promise<void> {
    this.clipboardMessage.set(null);
    this.clipboardMessageIsError.set(false);
    const result = await copyTextToClipboard(this.value());
    this.copyResult.set(result);
  }

  protected async onPaste(): Promise<void> {
    this.copyResult.set(null);
    const result = await readTextFromClipboard();
    if (result.status === 'read') {
      this.valueChange.emit(result.text);
      this.clipboardMessage.set(null);
      return;
    }
    if (result.status === 'unavailable') {
      this.clipboardMessage.set(this.pasteUnavailableMessage());
      this.clipboardMessageIsError.set(true);
      return;
    }
    this.clipboardMessage.set(this.pasteFailedMessage());
    this.clipboardMessageIsError.set(true);
  }

  protected onClear(): void {
    if (this.confirmClear() && !window.confirm('Очистить поле?')) {
      return;
    }
    this.valueChange.emit('');
    this.clipboardMessage.set(null);
    this.clipboardMessageIsError.set(false);
    this.copyResult.set(null);
  }

  protected onApplyClick(): void {
    if (this.applyButtonDisabled()) {
      return;
    }
    this.apply.emit();
  }
}
