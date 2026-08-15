import { Component } from '@angular/core';
import { CalendarComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  templateUrl: './example.html',
  styleUrl: './example.css',
  imports: [CalendarComponent],
})
export class CalendarLocaleExample {}
