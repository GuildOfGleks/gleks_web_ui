import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonComponent, FaIconComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly title = signal('gleks-ui-lab');
  protected readonly faCircleCheck = faCircleCheck;
  protected readonly wired = signal(false);

  protected onSmokeTestClick(): void {
    this.wired.set(true);
  }
}
