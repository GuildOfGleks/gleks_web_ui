import type { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  type GogCompiledMask,
  type GogMaskState,
  type GogMaskValue,
  caretAfterSlots,
  conformMask,
  isSlotAt,
} from './mask-engine';

const EMPTY: GogMaskState = { display: '', raw: '', complete: false, slots: 0 };

/**
 * Runs a mask on one `<input>`: conforms its text after an edit, keeps the caret after the same
 * slot characters, steps Backspace and Delete over literals, and leaves an IME composition alone.
 * It knows nothing about forms — `[gogMask]` and `gog-inputfield` each wire it to their own.
 *
 * The host forwards `input`, `keydown` and the two composition events, and passes on the state
 * each returns. The element is read lazily, so a host can write a value before its view exists.
 */
export class GogMaskController {
  private composing = false;
  private current: GogMaskState = EMPTY;

  constructor(
    private readonly element: () => HTMLInputElement | null | undefined,
    private readonly compiled: () => GogCompiledMask | null,
  ) {}

  /** The last conformed value. */
  get state(): GogMaskState {
    return this.current;
  }

  /** What the form gets: the slot characters, or the text as shown. */
  value(kind: GogMaskValue): string {
    return kind === 'raw' ? this.current.raw : this.current.display;
  }

  /** A value from the model: raw (`fromRaw`) or formatted, as the host's `maskValue` says. */
  write(value: string, fromRaw: boolean): GogMaskState {
    const compiled = this.compiled();
    this.current = compiled
      ? conformMask(compiled, value, fromRaw)
      : { ...EMPTY, display: value, raw: value };
    const element = this.element();
    if (element && element.value !== this.current.display) element.value = this.current.display;
    return this.current;
  }

  /** After an `input` event. `null` while an IME composition is open: nothing to report yet. */
  input(): GogMaskState | null {
    const element = this.element();
    const compiled = this.compiled();
    if (!element || !compiled || this.composing) return null;
    const text = element.value;
    const caret = element.selectionStart ?? text.length;
    const before = conformMask(compiled, text.slice(0, caret)).raw.length;
    return this.apply(compiled, element, conformMask(compiled, text), before);
  }

  /**
   * Backspace with a literal before the caret deletes the slot character before that literal —
   * otherwise the browser deletes the literal, the engine puts it straight back, and the caret is
   * stuck. Delete is the mirror. Returns the new state when it handled the key, `null` otherwise.
   */
  keydown(event: KeyboardEvent): GogMaskState | null {
    const element = this.element();
    const compiled = this.compiled();
    if (!element || !compiled || this.composing) return null;
    if (event.key !== 'Backspace' && event.key !== 'Delete') return null;
    if (event.ctrlKey || event.metaKey || event.altKey) return null;
    const start = element.selectionStart;
    if (start === null || start !== element.selectionEnd) return null;
    const display = element.value;

    if (event.key === 'Backspace') {
      if (start === 0 || isSlotAt(compiled, display, start - 1)) return null;
      let slot = start - 1;
      while (slot >= 0 && !isSlotAt(compiled, display, slot)) slot--;
      if (slot < 0) return null;
      event.preventDefault();
      const text = display.slice(0, slot) + display.slice(slot + 1);
      return this.apply(
        compiled,
        element,
        conformMask(compiled, text),
        slotsBefore(compiled, display, slot),
      );
    }

    if (start >= display.length || isSlotAt(compiled, display, start)) return null;
    let slot = start;
    while (slot < display.length && !isSlotAt(compiled, display, slot)) slot++;
    if (slot >= display.length) return null;
    event.preventDefault();
    const text = display.slice(0, slot) + display.slice(slot + 1);
    return this.apply(
      compiled,
      element,
      conformMask(compiled, text),
      slotsBefore(compiled, display, slot),
    );
  }

  compositionStart(): void {
    this.composing = true;
  }

  /** The composed text has landed: conform it now. */
  compositionEnd(): GogMaskState | null {
    this.composing = false;
    return this.input();
  }

  private apply(
    compiled: GogCompiledMask,
    element: HTMLInputElement,
    state: GogMaskState,
    slotsBeforeCaret: number,
  ): GogMaskState {
    this.current = state;
    if (element.value !== state.display) element.value = state.display;
    // Moving the selection of an unfocused input focuses it in Safari.
    if (element.ownerDocument.activeElement === element) {
      const caret = caretAfterSlots(compiled, state.display, slotsBeforeCaret);
      element.setSelectionRange(caret, caret);
    }
    return state;
  }
}

function slotsBefore(compiled: GogCompiledMask, display: string, index: number): number {
  let count = 0;
  for (let i = 0; i < index; i++) if (isSlotAt(compiled, display, i)) count++;
  return count;
}

/**
 * `{ gogMask: { actual, required } }` for a value that fills no pattern; `null` for an empty one,
 * which is `Validators.required`'s to judge. Reads the control's value, not a controller's state,
 * so it is right whichever order a form writes and validates in.
 */
export function gogMaskValidator(
  compiled: () => GogCompiledMask | null,
  kind: () => GogMaskValue,
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const mask = compiled();
    const value = control.value;
    if (!mask || value === null || value === undefined || value === '') return null;
    const state = conformMask(mask, String(value), kind() === 'raw');
    if (state.raw === '' || state.complete) return null;
    return { gogMask: { actual: state.raw.length, required: state.slots } };
  };
}
