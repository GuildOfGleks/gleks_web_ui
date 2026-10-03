import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InputfieldComponent, GogInputType } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [InputfieldComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputfieldTypesExample {
  protected readonly types: readonly { type: GogInputType; placeholder: string }[] = [
    { type: 'text', placeholder: 'Jane Doe' },
    { type: 'password', placeholder: 'Enter password' },
    { type: 'email', placeholder: 'jane@example.com' },
    { type: 'number', placeholder: '0' },
    { type: 'search', placeholder: 'Search…' },
    { type: 'tel', placeholder: '+1 555 0100' },
    { type: 'url', placeholder: 'https://example.com' },
    { type: 'date', placeholder: '' },
    { type: 'time', placeholder: '' },
    { type: 'datetime-local', placeholder: '' },
  ];
}
