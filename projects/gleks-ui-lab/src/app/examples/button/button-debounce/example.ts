import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonDebounceExample {
  protected readonly clicks = signal({ default: 0, zero: 0, slow: 0 });

  protected count(key: 'default' | 'zero' | 'slow'): void {
    this.clicks.update((clicks) => ({ ...clicks, [key]: clicks[key] + 1 }));
  }
}
