import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ToggleComponent, ReactiveFormsModule],
  template: `
    <gog-toggle label="Dark mode" [formControl]="darkMode" />
    <p>Control value: {{ darkMode.value }}</p>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
  `,
})
export class ToggleFormsExample {
  protected readonly darkMode = new FormControl(true);
}
