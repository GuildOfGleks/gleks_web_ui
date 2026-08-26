import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  ButtonComponent,
  GogColumn,
  GogPanelHeaderDirective,
  PanelComponent,
  ScrollComponent,
  TableComponent,
} from '@guildofgleks/ui';

interface DemoRow {
  component: string;
  status: string;
  owner: string;
}

const PARAGRAPHS: readonly string[] = [
  'gog-scroll hides the browser’s own scrollbar and draws a themeable overlay thumb in its place. The content underneath still scrolls natively — wheel, touch, keyboard and focus-into-view all keep working exactly as before.',
  'Because the scrolling itself is untouched, nothing about how you build the content inside changes. Drop in a long list, a form, an article, a table — anything that would normally overflow a fixed-height box.',
  'The thumb below is draggable, and clicking the empty part of the track pages the view up or down, the same way a native scrollbar track does.',
  'By default the thumb fades in on hover or while scrolling and fades back out after a short idle delay. Set [autoHide]="false" on an instance to keep it always visible instead — see the Auto-hide section below.',
  'Two size steps are available out of the box: "normal" and "thin". Thin suits compact chrome like a dropdown panel or a dialog body; normal suits a primary content area.',
  'axis controls which directions get a track at all: "vertical" (the default), "horizontal", or "both" — which also renders a small corner filler where the two tracks meet.',
  'Every visual property — track width, thumb color, radius, fade timing — is a --gog-scroll-* CSS custom property, overridable per instance, per subtree, or per theme, exactly like every other component in this library.',
  'This paragraph exists purely to push the total content past the fixed height of the box below, so there is actually something to scroll. Keep scrolling to reach the end.',
  'gogReachStart and gogReachEnd fire once per edge transition, which is enough to drive a "load more" trigger or know when a chat log is pinned to the bottom — see the Reach events card further down this page.',
  'And that’s the last paragraph — if you can read this, you’ve scrolled all the way to the bottom.',
];

@Component({
  selector: 'app-scroll-page',
  imports: [
    ScrollComponent,
    ButtonComponent,
    GogPanelHeaderDirective,
    PanelComponent,
    TableComponent,
    GogColumn,
  ],
  templateUrl: './scroll-page.html',
  styleUrl: './scroll-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollPage {
  protected readonly paragraphs = PARAGRAPHS;

  protected readonly wideCards = Array.from({ length: 14 }, (_, i) => `Card ${i + 1}`);
  protected readonly gridCells = Array.from({ length: 40 }, (_, i) => i + 1);

  protected readonly reachedEnd = signal(false);

  protected onReachEnd(axis: 'vertical' | 'horizontal'): void {
    if (axis === 'vertical') this.reachedEnd.set(true);
  }

  protected onReachStart(axis: 'vertical' | 'horizontal'): void {
    if (axis === 'vertical') this.reachedEnd.set(false);
  }

  protected readonly tableRows: DemoRow[] = [
    { component: 'Buttons', status: 'Ready', owner: 'Design' },
    { component: 'Checkbox', status: 'Ready', owner: 'Forms' },
    { component: 'Table', status: 'In review', owner: 'Data' },
    { component: 'Accordion', status: 'Planned', owner: 'Navigation' },
    { component: 'Spinner', status: 'Ready', owner: 'Feedback' },
    { component: 'Dialog', status: 'Ready', owner: 'Overlays' },
    { component: 'Multiselect', status: 'In review', owner: 'Forms' },
    { component: 'Toast', status: 'Ready', owner: 'Feedback' },
  ];
}
