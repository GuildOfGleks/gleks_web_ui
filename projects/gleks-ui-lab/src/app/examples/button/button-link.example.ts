import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GogButtonDirective } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [GogButtonDirective, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- The element stays yours; [gogButton] only gives it the look, so routerLink, href,
         target and download keep working — they were never brokered through an input. -->
    <a gogButton routerLink="/general/theming">See theming</a>
    <a
      gogButton
      variant="ghost"
      href="https://www.npmjs.com/package/@guildofgleks/ui"
      target="_blank"
      rel="noreferrer"
      >Package on npm</a
    >
    <button gogButton variant="outline" size="sm" type="button">A real button</button>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
})
export class ButtonLinkExample {}
