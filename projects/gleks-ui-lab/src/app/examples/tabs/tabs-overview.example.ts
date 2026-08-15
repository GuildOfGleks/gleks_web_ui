import { Component, signal } from '@angular/core';
import { TabComponent, TabsComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [TabsComponent, TabComponent],
  template: `
    <gog-tabs ariaLabel="Account" [(activeIndex)]="activeIndex">
      <gog-tab label="Profile">Profile content.</gog-tab>
      <gog-tab label="Settings" iconName="info">Settings content.</gog-tab>
      <gog-tab label="Billing" [disabled]="true">Not available.</gog-tab>
    </gog-tabs>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
    }
  `,
})
export class TabsOverviewExample {
  protected readonly activeIndex = signal(0);
}
