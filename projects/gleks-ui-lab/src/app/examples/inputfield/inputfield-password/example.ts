import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InputfieldComponent, GogInputAddonEndDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent, GogInputAddonEndDirective],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldPasswordExample {}
