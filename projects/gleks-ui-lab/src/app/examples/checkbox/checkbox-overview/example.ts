import { Component, signal } from '@angular/core';
import { CheckboxComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [CheckboxComponent],
})
export class CheckboxOverviewExample {
  protected readonly agreed = signal(false);
}
