import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';

import { Subject, timer } from 'rxjs';
import { throttle } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { GogSize, GogVariant } from '../../shared/types';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'gog-button',
  imports: [SpinnerComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  variant = input<GogVariant>('primary');
  size = input<GogSize>('md');
  disabled = input<boolean>(false);
  fullWidth = input<boolean>(false);
  type = input<'button' | 'submit' | 'reset'>('button');
  debounce = input<number>(300);
  loading = input<boolean>(false);

  gogClick = output<MouseEvent>();

  protected isDisabled = computed(() => this.disabled() || this.loading());
  protected spinnerSize = computed<GogSize>(() => (this.size() === 'lg' ? 'md' : 'sm'));

  private readonly destroyRef = inject(DestroyRef);
  private readonly click$ = new Subject<MouseEvent>();

  constructor() {
    this.click$
      .pipe(
        throttle(() => timer(this.debounce()), { leading: true, trailing: false }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.gogClick.emit(event));
  }

  protected onClick(event: MouseEvent): void {
    if (this.isDisabled()) return;
    this.click$.next(event);
  }
}
