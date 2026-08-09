import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { TokenControl } from '../../shared/token-value';

/**
 * One editable `--gog-*` token row: name, the color-picker/slider/text control its value
 * calls for, and a reset-to-default button when overridden. Shared between the Foundation
 * editor and the per-component "fine-tune" editor on the theme generator page — both need
 * the exact same row, just fed a different token list.
 */
@Component({
  selector: 'app-token-row-editor',
  imports: [],
  templateUrl: './token-row-editor.html',
  styleUrl: './token-row-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokenRowEditor {
  readonly name = input.required<string>();
  readonly control = input.required<TokenControl>();
  readonly value = input.required<string>();
  readonly overridden = input(false);

  readonly valueChange = output<string>();
  readonly reset = output<void>();

  protected currentNumeric(): number {
    const control = this.control();
    if (control.kind !== 'range') return 0;
    const parsed = Number.parseFloat(this.value());
    return Number.isFinite(parsed) ? parsed : control.numericValue;
  }

  protected onText(value: string): void {
    this.valueChange.emit(value);
  }

  protected onRange(value: string): void {
    const control = this.control();
    if (control.kind !== 'range') return;
    this.valueChange.emit(`${value}${control.unit}`);
  }
}
