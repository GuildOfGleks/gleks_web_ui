import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  ButtonToggleGroupComponent,
  GogButtonToggleAppearance,
  GogButtonToggleOptionDirective,
  GogIconName,
  GogSize,
  IconComponent,
} from '@guildofgleks/ui';

/** A consumer's own DTO — deliberately not `{ id, name }`, to exercise the accessors. */
interface ViewMode {
  key: string;
  title: string;
  glyph: GogIconName;
  locked?: boolean;
}

const VIEWS: ViewMode[] = [
  { key: 'list', title: 'List', glyph: 'sort' },
  { key: 'grid', title: 'Grid', glyph: 'checkbox' },
  { key: 'map', title: 'Map', glyph: 'info', locked: true },
  { key: 'chart', title: 'Chart', glyph: 'sort-up' },
];

const TOOLS = [
  { id: 'bold', name: 'Bold' },
  { id: 'italic', name: 'Italic' },
  { id: 'underline', name: 'Underline' },
];

@Component({
  selector: 'app-button-toggle-page',
  imports: [
    ButtonToggleGroupComponent,
    GogButtonToggleOptionDirective,
    IconComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './button-toggle-page.html',
  styleUrl: './button-toggle-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonTogglePage {
  protected readonly views = VIEWS;
  protected readonly tools = TOOLS;
  protected readonly appearances: GogButtonToggleAppearance[] = ['joined', 'separated'];
  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];

  protected readonly view = signal<string | null>('list');
  protected readonly activeTools = signal<string[]>(['bold']);
  protected readonly viewObject = signal<ViewMode | null>(null);
  protected readonly formView = new FormControl<string | null>('grid');

  /**
   * A `gogButtonToggleOption` template's context cannot infer `TOption` when the directive is
   * declared standalone in a template — the documented cost of the component being generic.
   * One cast at the boundary keeps the rest of the template typed.
   */
  protected asView(option: unknown): ViewMode {
    return option as ViewMode;
  }
}
