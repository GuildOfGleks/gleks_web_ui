import { Component } from '@angular/core';
import { IconComponent, provideGogIcons } from '@guildofgleks/ui';

const CART =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
  '<circle cx="9" cy="20" r="1.5" /><circle cx="18" cy="20" r="1.5" />' +
  '<path d="M2 3h3l2.5 12h11L21 7H6" /></svg>';

const ROCKET =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
  '<path d="M5 15l-2 6 6-2M14 4c4 2 6 6 6 10l-6 6-4-4 4-12z" /><circle cx="15" cy="9" r="1.5" /></svg>';

@Component({
  selector: 'app-example',
  imports: [IconComponent],
  // In an app this goes in `appConfig.providers` and applies everywhere. Providing it on a
  // component scopes the set to that subtree — a lazy feature can register only what it uses,
  // and nested providers layer onto the parent's set rather than replacing it.
  providers: [provideGogIcons({ cart: CART, rocket: ROCKET })],
  template: `
    <gog-icon name="cart" />
    <gog-icon name="rocket" />
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 16px;
      --gog-icon-size: 28px;
    }
  `,
})
export class IconRegisterExample {}
