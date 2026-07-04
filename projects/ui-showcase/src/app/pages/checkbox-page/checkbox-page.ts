import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CheckboxComponent } from '@gleks/ui';

@Component({
  selector: 'app-checkbox-page',
  imports: [CheckboxComponent],
  templateUrl: './checkbox-page.html',
  styleUrl: './checkbox-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxPage {
  protected readonly acceptTerms = signal(true);
  protected readonly subscribeNewsletter = signal(false);
  protected readonly triState = signal(false);
  protected readonly disabledChecked = signal(true);
  protected readonly disabledIndeterminate = signal(false);

  protected readonly summary = computed(() => 
    `Terms: ${this.acceptTerms() ? 'accepted' : 'declined'} · Newsletter: ${
      this.subscribeNewsletter() ? 'subscribed' : 'not subscribed'
    }`,
  );
}
