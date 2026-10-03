import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GOG_DEPRECATIONS } from '@guildofgleks/ui';
import { ApiTableComponent, type ApiRow } from '../../shared/api-table/api-table';
import { DemoComponent } from '../../shared/demo/demo';
import { GlobalConfigNote } from '../../shared/global-config-note/global-config-note';
import { MarkdownComponent } from '../../shared/markdown/markdown';
import { SinceBadgeComponent } from '../../shared/since-badge/since-badge';
import { TOKEN_SECTIONS } from '../theming-page/token-reference-data';
import { AUTOCOMPLETE_EXAMPLES } from '../../../examples/autocomplete/sources.generated';
import { AutocompleteAccessorsExample } from '../../../examples/autocomplete/autocomplete-accessors/example';
import { AutocompleteAppendToBodyExample } from '../../../examples/autocomplete/autocomplete-append-to-body/example';
import { AutocompleteAriaLabelExample } from '../../../examples/autocomplete/autocomplete-aria-label/example';
import { AutocompleteBindingExample } from '../../../examples/autocomplete/autocomplete-binding/example';
import { AutocompleteClearableExample } from '../../../examples/autocomplete/autocomplete-clearable/example';
import { AutocompleteConfigExample } from '../../../examples/autocomplete/autocomplete-config/example';
import { AutocompleteDebounceExample } from '../../../examples/autocomplete/autocomplete-debounce/example';
import { AutocompleteDisabledOptionExample } from '../../../examples/autocomplete/autocomplete-disabled-option/example';
import { AutocompleteFilterMatchExample } from '../../../examples/autocomplete/autocomplete-filter-match/example';
import { AutocompleteFloatLabelExample } from '../../../examples/autocomplete/autocomplete-float-label/example';
import { AutocompleteFormsExample } from '../../../examples/autocomplete/autocomplete-forms/example';
import { AutocompleteFreeTextExample } from '../../../examples/autocomplete/autocomplete-free-text/example';
import { AutocompleteLoadMoreExample } from '../../../examples/autocomplete/autocomplete-load-more/example';
import { AutocompleteOpenOnFocusExample } from '../../../examples/autocomplete/autocomplete-open-on-focus/example';
import { AutocompleteOverviewExample } from '../../../examples/autocomplete/autocomplete-overview/example';
import { AutocompleteServerExample } from '../../../examples/autocomplete/autocomplete-server/example';
import { AutocompleteSizesExample } from '../../../examples/autocomplete/autocomplete-sizes/example';
import { AutocompleteStatesExample } from '../../../examples/autocomplete/autocomplete-states/example';
import { AutocompleteVirtualizeExample } from '../../../examples/autocomplete/autocomplete-virtualize/example';
import { AutocompleteWidthExample } from '../../../examples/autocomplete/autocomplete-width/example';

const OWN_INPUTS: readonly ApiRow[] = [
  {
    name: 'openOnFocus',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Whether focusing the field opens the panel immediately with the full option list, rather than waiting for minLength characters. Unset, falls back to GOG_CONFIG.autocomplete.openOnFocus, then to true.',
    since: '21.3.1',
  },
  {
    name: 'value',
    type: 'TValue',
    default: 'null',
    description:
      'The selected value — whatever optionValue resolves to. Two-way bindable with [(value)].',
  },
  {
    name: 'filterLocal',
    type: 'boolean',
    default: 'true',
    description:
      'Whether options are narrowed in the browser as you type. Turn it OFF when gogSearch fetches an already-filtered list: filtering that answer a second time is the classic double-filtering bug, and it silently drops rows the server matched on a field this component cannot see.',
  },
  {
    name: 'minLength',
    type: 'number',
    default: 'GOG_CONFIG.autocomplete.minLength ?? 1',
    description: 'How many characters before the panel opens at all.',
  },
  {
    name: 'searchDebounce',
    type: 'number',
    default: 'GOG_CONFIG.autocomplete.searchDebounce ?? 300',
    description: 'Milliseconds of quiet before gogSearch fires. 0 emits on every keystroke.',
  },
  {
    name: 'loading',
    type: 'boolean',
    default: 'false',
    description: 'Shows a spinner in the trailing slot, for a server-backed source still fetching.',
  },
  {
    name: 'emptyMessage',
    type: 'string',
    default: "'No matches'",
    description: 'Shown in place of the list when nothing matches.',
  },
  {
    name: 'forceSelection',
    type: 'boolean',
    default: 'true',
    description:
      'On, the field always ends up reflecting a real selection — editing is transient and Escape or blur snaps the text back. Off, the typed text is itself meaningful (a create-as-you-type flow): it is left alone by blur and by Escape, which only closes the panel, and value is dropped as soon as it stops matching, so the two never disagree.',
  },
  {
    name: 'inputId',
    type: 'string',
    default: "''",
    description: 'id for the inner <input>, for an external <label for="…">.',
  },
  {
    name: 'ripple',
    type: 'boolean | undefined',
    default: 'undefined',
    description:
      'Press ripple on each option row in the panel. Unset, falls back to GOG_CONFIG.ripple.enabled, which is off by default; setting it here wins over the app-wide value in both directions.',
    since: '21.6.1',
  },
  {
    name: 'virtualize',
    type: 'boolean | undefined',
    default: 'GOG_CONFIG.dropdown.virtualize ?? false',
    description:
      'Renders only the suggestion rows in view — about twenty in the DOM whatever the list holds. Off by default and never switched on at a row count: Ctrl+F finds only rendered rows and :last-child matches the last rendered one. aria-setsize/aria-posinset keep the announced count real.',
    since: '21.13.0',
  },
];

/**
 * The panel-search-box inputs this control inherits and deprecated in 21.15.0. Matched by name
 * against the manifest, which names inputs without their component — so the set is spelled out
 * here, and the table empties itself once the installed package stops listing them.
 */
const DEPRECATED_INPUT_NAMES = new Set([
  'filter',
  'filterPlaceholder',
  'filterPosition',
  'filterEmptyMessage',
]);

const SHARED_INPUTS: readonly ApiRow[] = [
  {
    name: 'options',
    type: 'readonly TOption[]',
    default: '[]',
    description: 'The suggestions. Your own objects.',
  },
  {
    name: 'optionLabel',
    type: 'string | ((o: TOption) => string)',
    default: "'name'",
    description: 'Property path (dot-paths included) or function producing an option’s label.',
  },
  {
    name: 'optionValue',
    type: 'string | ((o: TOption) => unknown) | null',
    default: "'id'",
    description: 'What the control emits. null emits the option object itself.',
  },
  {
    name: 'optionDisabled',
    type: 'string | ((o: TOption) => boolean)',
    default: "'disabled'",
    description: 'Which suggestions cannot be picked.',
  },
  {
    name: 'filterMatch',
    type: '((option: TOption, query: string) => boolean) | null',
    default: 'null',
    description:
      'How filterLocal matches an option against the typed text. Left null, the resolved optionLabel is matched case-insensitively as a substring.',
  },
  {
    name: 'label / placeholder / ariaLabel',
    type: 'string',
    default: "'' / 'Select...' / ''",
    description: 'Field label, placeholder and accessible name.',
  },
  {
    name: 'clearable / clearAriaLabel',
    type: 'boolean / string',
    default: "GOG_CONFIG.control.clearable ?? false / 'Clear selection'",
    description: 'A clear button that appears only once there is something to clear.',
  },
  {
    name: 'floatLabel / floatLabelShowPlaceholder',
    type: "'none' | 'in' | 'on' | 'over' / boolean",
    default: "GOG_CONFIG.floatLabel.* ?? 'none' / false",
    description: 'Float-label variant and whether the placeholder reappears once it has floated.',
  },
  {
    name: 'errorMessage / errorDisplay',
    type: "string / 'manual' | 'auto'",
    default: "'' / GOG_CONFIG.control.errorDisplay ?? 'manual'",
    description: 'Validation message, shown manually or derived from the bound form control.',
  },
  {
    name: 'size / disabled / fullWidth / minWidth',
    type: 'GogSize / boolean / boolean / string | null',
    default: "GOG_CONFIG.control.size ?? 'md' / false / true / null",
    description: 'Density, disabled state, and how the field sizes itself.',
  },
  {
    name: 'appendToBody / dropdownDirection / dropdownWidth / dropdownMaxHeight / dropdownZIndex',
    type: 'boolean / GogDropdownDirection / string | null / string | null / number | null',
    default: 'GOG_CONFIG.dropdown.* ?? component defaults',
    description:
      'Panel placement. appendToBody renders it into <body> so an overflow-clipped ancestor cannot cut it off.',
  },
];

const API_OUTPUTS: readonly ApiRow[] = [
  {
    name: 'gogSearch',
    type: 'string',
    description: 'The current query, debounced. Wire a server-side lookup to this.',
  },
  {
    name: 'gogLoadMore',
    type: 'void',
    description:
      'The panel was scrolled to the end. Fetch the next page and append it to options — this is how a large or server-backed option source is paged without a virtual scroller.',
    since: '21.3.1',
  },
  {
    name: 'valueChange',
    type: 'TValue',
    description: 'Emitted when the selection changes. Comes from the value model input.',
  },
];

const API_SLOTS: readonly ApiRow[] = [
  {
    name: 'gogDropdownOption',
    type: '$implicit, selected, disabled, label',
    description: 'Replaces one suggestion row.',
  },
  {
    name: '[gogDropdownOptionTypeOf]',
    type: 'readonly TOption[] — an input on gogDropdownOption',
    description:
      'Bind the same array as options and $implicit is typed as its element instead of unknown. Never read at runtime; left unbound, the template compiles exactly as before.',
    since: '21.15.0',
  },
];

@Component({
  selector: 'app-autocomplete-doc-page',
  imports: [
    ApiTableComponent,
    DemoComponent,
    GlobalConfigNote,
    MarkdownComponent,
    RouterLink,
    SinceBadgeComponent,
  ],
  templateUrl: './autocomplete-doc-page.html',
  styleUrl: './autocomplete-doc-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteDocPage {
  protected readonly apiInputs = OWN_INPUTS;
  protected readonly sharedInputs = SHARED_INPUTS;
  protected readonly apiOutputs = API_OUTPUTS;
  protected readonly apiSlots = API_SLOTS;
  protected readonly deprecatedInputs: readonly ApiRow[] = GOG_DEPRECATIONS.filter(
    (entry) => entry.kind === 'symbol' && DEPRECATED_INPUT_NAMES.has(entry.name),
  ).map((entry) => ({
    name: entry.name,
    type: `${entry.since} (${entry.sinceDate})`,
    default: entry.removedIn,
    description: entry.replacement,
  }));
  protected readonly styleTokens =
    TOKEN_SECTIONS.find((section) => section.id === 'autocomplete')?.tokens ?? [];

  protected readonly sources = AUTOCOMPLETE_EXAMPLES;
  protected readonly examples = {
    overview: AutocompleteOverviewExample,
    sizes: AutocompleteSizesExample,
    states: AutocompleteStatesExample,
    clearable: AutocompleteClearableExample,
    width: AutocompleteWidthExample,
    ariaLabel: AutocompleteAriaLabelExample,
    accessors: AutocompleteAccessorsExample,
    disabledOption: AutocompleteDisabledOptionExample,
    filterMatch: AutocompleteFilterMatchExample,
    binding: AutocompleteBindingExample,
    freeText: AutocompleteFreeTextExample,
    forms: AutocompleteFormsExample,
    floatLabel: AutocompleteFloatLabelExample,
    config: AutocompleteConfigExample,
    openOnFocus: AutocompleteOpenOnFocusExample,
    debounce: AutocompleteDebounceExample,
    server: AutocompleteServerExample,
    loadMore: AutocompleteLoadMoreExample,
    appendToBody: AutocompleteAppendToBodyExample,
    virtualize: AutocompleteVirtualizeExample,
  };

  protected readonly importSnippet =
    "```typescript\nimport { AutocompleteComponent } from '@guildofgleks/ui';\n\n@Component({\n  // ...\n  imports: [AutocompleteComponent],\n})\n```";
}
