import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * A schematic drawing of one component, for the cards on the Components page — the shape of the
 * thing rather than a screenshot of it. Every fill and stroke is a theme token, so the drawings
 * follow the site's theme and its light/dark switch with nothing to regenerate; a screenshot
 * would show one theme and go stale with every change to how a component looks.
 *
 * `name` is the component's slug (`components/<name>`); an unknown one draws nothing.
 */
@Component({
  selector: 'app-component-illustration',
  templateUrl: './component-illustration.html',
  styleUrl: './component-illustration.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentIllustrationComponent {
  readonly name = input.required<string>();
}
