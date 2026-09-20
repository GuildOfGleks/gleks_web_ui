import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DOCUMENT,
  effect,
  inject,
  input,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { GOG_TOKEN_GROUPS, ThemeService } from '@guildofgleks/ui';

/**
 * Every token of the named `theme.css` sections, with the value it resolves to at `:root` in the
 * active theme. The list comes from `GOG_TOKEN_GROUPS`, so it cannot drift from the package.
 */
@Component({
  selector: 'app-doc-tokens',
  template: `
    @if (groups().length === 0) {
      <p class="doc-tokens__none">
        This unit declares no tokens of its own. It renders inside another component, which is
        themed by that component's own group.
      </p>
    }
    @for (group of groups(); track group.section) {
      <h3>{{ group.section }} · {{ group.tokens.length }}</h3>
      <div class="doc-api__scroll">
        <table>
          <colgroup>
            <col class="doc-tokens__name" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Token</th>
              <th scope="col">
                Value at <code>:root</code>, theme <code>{{ theme() }}</code>
              </th>
            </tr>
          </thead>
          <tbody>
            @for (token of group.tokens; track token) {
              <tr>
                <th scope="row">
                  <code>{{ token }}</code>
                </th>
                <td>
                  <code>{{ values()[token] ?? '…' }}</code>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
  styles: `
    .doc-tokens__none {
      margin: 0;
      color: var(--gog-muted-text-color);
    }
  `,
  styleUrl: './doc-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocTokens {
  /** Section headings exactly as `GOG_TOKEN_GROUPS` names them. */
  readonly sections = input.required<readonly string[]>();

  protected readonly theme = inject(ThemeService).theme;
  protected readonly groups = computed(() =>
    GOG_TOKEN_GROUPS.filter((group) => this.sections().includes(group.section)),
  );
  protected readonly values = signal<Readonly<Partial<Record<string, string>>>>({});

  constructor() {
    const document = inject(DOCUMENT);
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    // `setTheme` writes `data-theme` synchronously, so the computed style is already current here.
    effect(() => {
      this.theme();
      const style = getComputedStyle(document.documentElement);
      const values: Record<string, string> = {};
      for (const group of this.groups()) {
        for (const token of group.tokens) {
          values[token] = style.getPropertyValue(token).trim() || '(not set at :root)';
        }
      }
      this.values.set(values);
    });
  }
}
