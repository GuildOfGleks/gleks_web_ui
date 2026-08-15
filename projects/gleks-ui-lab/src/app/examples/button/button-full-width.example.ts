import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel">
      <gog-button variant="outline" [fullWidth]="true">Full width</gog-button>
    </div>
  `,
  styles: `
    .panel {
      max-width: 320px;
    }
  `,
})
export class ButtonFullWidthExample {}
