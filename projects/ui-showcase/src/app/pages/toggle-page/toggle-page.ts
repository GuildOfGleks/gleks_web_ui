import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent, GogSize, ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-toggle-page',
  imports: [CheckboxComponent, ReactiveFormsModule, ToggleComponent],
  templateUrl: './toggle-page.html',
  styleUrl: './toggle-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TogglePage {
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly notifications = signal(true);
  protected readonly analytics = signal(false);
  protected readonly darkMode = new FormControl(false);
  protected readonly locked = new FormControl({ value: true, disabled: true });
}
