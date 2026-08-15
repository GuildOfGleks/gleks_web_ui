import { Component } from '@angular/core';
import { CheckboxComponent, IconComponent, provideGogIcons } from '@guildofgleks/ui';

// A double-stroke tick, replacing the library's own.
const CHECK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">' +
  '<path d="M4 13l5 5L20 6" /></svg>';

@Component({
  selector: 'app-example',
  imports: [IconComponent, CheckboxComponent],
  // A registered name wins over the built-in of the same name, so every checkmark the library
  // draws — checkbox, multiselect, toast — becomes yours with no call site touched.
  providers: [provideGogIcons({ check: CHECK })],
  template: `
    <gog-icon name="check" />
    <gog-checkbox label="Checkbox drawn with the same icon" [checked]="true" />
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  `,
})
export class IconOverrideExample {}
