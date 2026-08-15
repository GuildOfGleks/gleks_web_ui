import { Component } from '@angular/core';
import { CheckboxComponent, GogCheckboxIconDirective, IconComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [CheckboxComponent, GogCheckboxIconDirective, IconComponent],
})
export class CheckboxCheckIconExample {}
