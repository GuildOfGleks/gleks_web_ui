import type { GogAccordionItem } from '@guildofgleks/ui';

export interface TokenRow {
  readonly name: string;
  readonly description: string;
}

export interface TokenSection extends GogAccordionItem {
  readonly tokens: readonly TokenRow[];
}

export const TOKEN_SECTIONS: TokenSection[] = [
  {
    id: 'foundation-palette',
    title: 'Foundation — Palette',
    tokens: [
      { name: '--gog-background-color', description: 'Page / app background.' },
      { name: '--gog-surface-color', description: 'Card, panel and control surface background.' },
      { name: '--gog-hover-color', description: 'Hover background for interactive surfaces.' },
      { name: '--gog-border-color', description: 'Default border color.' },
      { name: '--gog-text-color', description: 'Primary text color.' },
      { name: '--gog-muted-text-color', description: 'Secondary / placeholder text color.' },
      {
        name: '--gog-accent-text-color',
        description: 'Text color placed on top of an accent-colored background.',
      },
      { name: '--gog-primary-color', description: 'Primary brand color.' },
      {
        name: '--gog-accent-color',
        description: 'Accent / brand color used for interactive elements.',
      },
      { name: '--gog-accent-bright', description: 'Brighter accent, used for hover states.' },
      { name: '--gog-accent-dim', description: 'Dimmed accent, used for borders and strokes.' },
      { name: '--gog-accent-pale', description: 'Pale accent tint, used for subtle backgrounds.' },
      { name: '--gog-secondary-color', description: 'Secondary brand color.' },
      { name: '--gog-success-color', description: 'Semantic success color.' },
      { name: '--gog-danger-color', description: 'Semantic danger / error color.' },
      { name: '--gog-warning-color', description: 'Semantic warning color.' },
      { name: '--gog-info-color', description: 'Semantic info color.' },
      {
        name: '--gog-panel-shadow',
        description: 'Drop shadow for elevated panels (dialogs, dropdowns).',
      },
    ],
  },
  {
    id: 'foundation-typography',
    title: 'Foundation — Typography',
    tokens: [
      { name: '--gog-font-heading', description: 'Font stack used for headings and titles.' },
      { name: '--gog-font-body', description: 'Font stack used for body text.' },
      { name: '--gog-font-mono', description: 'Monospace font stack (code, numeric values).' },
      { name: '--gog-text-xs … --gog-text-3xl', description: 'Type scale, from 0.75rem to 3rem.' },
    ],
  },
  {
    id: 'foundation-spacing-radius',
    title: 'Foundation — Spacing & Radius',
    tokens: [
      { name: '--gog-space-xs … --gog-space-2xl', description: 'Spacing scale, from 4px to 48px.' },
      { name: '--gog-radius', description: 'Base corner radius used across most components.' },
      {
        name: '--gog-panel-radius',
        description: 'Corner radius for larger panels — derived from --gog-radius.',
      },
      {
        name: '--gog-panel-border-width / --gog-panel-border-style',
        description: 'Border width and style for elevated panels.',
      },
    ],
  },
  {
    id: 'foundation-motion-focus',
    title: 'Foundation — Motion & Focus',
    tokens: [
      {
        name: '--gog-duration-fast / -base / -slow',
        description: 'Transition durations used by every animated component.',
      },
      { name: '--gog-easing', description: 'Default transition easing function.' },
      {
        name: '--gog-focus-ring-width / --gog-focus-ring-offset',
        description: 'Keyboard focus ring size and offset.',
      },
      { name: '--gog-disabled-opacity', description: 'Opacity applied to disabled controls.' },
    ],
  },
  {
    id: 'foundation-control-metrics',
    title: 'Foundation — Control Metrics',
    tokens: [
      {
        name: '--gog-control-padding-y / -x',
        description: 'Shared padding for form controls (buttons, fields).',
      },
      { name: '--gog-control-icon-offset', description: 'Icon inset shared by form controls.' },
      {
        name: '--gog-control-border-width / -style',
        description: 'Shared border width and style for form controls.',
      },
      {
        name: '--gog-control-checkbox-{size}-box-size / -label-size / -icon-size',
        description: 'Checkbox box, label and icon size, per size step (xsm/sm/md/lg/slg).',
      },
    ],
  },
  {
    id: 'accordion',
    title: 'Accordion',
    tokens: [
      {
        name: '--gog-accordion-border-color / -width / -style',
        description: 'Header border.',
      },
      { name: '--gog-accordion-text-color / -accent-color', description: 'Text and accent color.' },
      {
        name: '--gog-accordion-hover-bg / -hover-ring',
        description: 'Header hover background and focus ring.',
      },
      {
        name: '--gog-accordion-radius / -body-radius',
        description: 'Corner radius for the header and body.',
      },
      {
        name: '--gog-accordion-header-bg / -body-bg',
        description: 'Header and body background.',
      },
      { name: '--gog-accordion-header-gap', description: 'Gap between chevron and title.' },
      {
        name: '--gog-accordion-transition-duration / -body-transition-duration / -chevron-transition-duration',
        description: 'Expand/collapse animation timing.',
      },
      {
        name: '--gog-accordion-{size}-padding-y / -x / -font-size',
        description: 'Header padding and font size, per size step (xsm/sm/md/lg/slg).',
      },
    ],
  },
  {
    id: 'button',
    title: 'Button',
    tokens: [
      {
        name: '--gog-btn-font-family / -font-weight / -letter-spacing / -text-transform',
        description: 'Label typography.',
      },
      { name: '--gog-btn-radius', description: 'Corner radius.' },
      { name: '--gog-btn-border-width / -style', description: 'Border.' },
      { name: '--gog-btn-transition-duration', description: 'Hover / active transition timing.' },
      {
        name: '--gog-btn-{variant}-bg / -color / -border / -shadow',
        description: 'Fill, text, border and shadow per variant (primary/secondary/outline/ghost).',
      },
      {
        name: '--gog-btn-{variant}-hover-bg / -hover-color / -hover-shadow',
        description: 'Hover state per variant.',
      },
      {
        name: '--gog-btn-bg / -color / -border / -padding / -font-size',
        description:
          'Undeclared by default — the escape hatch for styling a single button instance.',
      },
    ],
  },
  {
    id: 'checkbox',
    title: 'Checkbox',
    tokens: [
      { name: '--gog-checkbox-gap', description: 'Gap between box and label.' },
      { name: '--gog-checkbox-radius', description: 'Box corner radius.' },
      {
        name: '--gog-checkbox-border-width / -style / -color',
        description: 'Box border.',
      },
      {
        name: '--gog-checkbox-bg / -checked-bg / -checked-border',
        description: 'Box background, unchecked and checked.',
      },
      { name: '--gog-checkbox-icon-color', description: 'Checkmark color.' },
      { name: '--gog-checkbox-label-color', description: 'Label text color.' },
      {
        name: '--gog-checkbox-focus-ring / -focus-ring-width / -focus-ring-offset',
        description: 'Keyboard focus ring.',
      },
    ],
  },
  {
    id: 'chip',
    title: 'Chip',
    tokens: [
      { name: '--gog-chip-bg / -hover-bg', description: 'Background, default and hover.' },
      { name: '--gog-chip-border / -border-width / -style', description: 'Border.' },
      { name: '--gog-chip-color / -font-weight', description: 'Text color and weight.' },
      {
        name: '--gog-chip-radius / -pill-radius',
        description: 'Corner radius, square and pill shape.',
      },
      {
        name: '--gog-chip-remove-color / -remove-hover-color',
        description: 'Remove (×) icon color.',
      },
      {
        name: '--gog-chip-{size}-font-size / -padding-block / -padding-inline / -gap / -avatar-size / -icon-size',
        description: 'Full sizing scale, per size step (xsm/sm/md/lg/slg).',
      },
    ],
  },
  {
    id: 'collapsible',
    title: 'Collapsible',
    tokens: [
      {
        name: '--gog-collapsible-transition-duration',
        description: 'Expand/collapse animation timing.',
      },
      {
        name: '--gog-collapsible-max-height',
        description:
          'Fixed cap the open content transitions toward (a CSS-only max-height animation can\'t target a measured "auto" height). Raise it per-instance if a panel\'s content can exceed 480px.',
      },
      {
        name: '--gog-collapsible-disabled-opacity',
        description: 'Opacity applied to a disabled trigger.',
      },
    ],
  },
  {
    id: 'dialog',
    title: 'Dialog',
    tokens: [
      {
        name: '--gog-dialog-backdrop-bg / -backdrop-blur',
        description: 'Scrim behind the dialog.',
      },
      {
        name: '--gog-dialog-bg / -color / -border / -radius / -shadow',
        description: 'Panel surface.',
      },
      {
        name: '--gog-dialog-header-padding / -body-padding',
        description: 'Section padding.',
      },
      {
        name: '--gog-dialog-close-color / -close-hover-color / -close-hover-bg',
        description: 'Close button.',
      },
      {
        name: '--gog-confirm-color / -description-color / -actions-gap',
        description: 'Confirmation dialog variant.',
      },
    ],
  },
  {
    id: 'icon',
    title: 'Icon',
    tokens: [
      { name: '--gog-icon-size', description: 'Default icon size.' },
      { name: '--gog-icon-stroke-width', description: 'Stroke width for outline icons.' },
      { name: '--gog-icon-fallback-size', description: 'Size used when no size is set.' },
    ],
  },
  {
    id: 'input-field',
    title: 'Input Field',
    tokens: [
      { name: '--gog-input-label-color', description: 'Field label color.' },
      {
        name: '--gog-input-field-bg / -field-border / -field-color',
        description: 'Field surface, border and text.',
      },
      { name: '--gog-input-radius', description: 'Field corner radius.' },
      {
        name: '--gog-input-focus-border / -focus-ring / -focus-glow',
        description: 'Focus state.',
      },
      { name: '--gog-input-error-color', description: 'Validation error color.' },
      {
        name: '--gog-input-icon-color / -icon-hover-color',
        description: 'Prefix / suffix icon color.',
      },
    ],
  },
  {
    id: 'multiselect',
    title: 'Multiselect',
    tokens: [
      { name: '--gog-ms-label-color', description: 'Field label color.' },
      {
        name: '--gog-ms-field-bg / -field-border',
        description: 'Field surface and border.',
      },
      { name: '--gog-ms-radius', description: 'Field corner radius.' },
      { name: '--gog-ms-focus-border / -focus-ring', description: 'Focus state.' },
      {
        name: '--gog-ms-panel-bg / -panel-border / -panel-shadow',
        description: 'Dropdown panel surface.',
      },
      {
        name: '--gog-ms-option-hover-bg / -option-color',
        description: 'Option row, default and hover.',
      },
      {
        name: '--gog-ms-checkbox-bg / -checkbox-checked-bg',
        description: 'Per-option selection checkbox.',
      },
    ],
  },
  {
    id: 'paginator',
    title: 'Paginator',
    tokens: [
      { name: '--gog-paginator-gap', description: 'Gap between page controls.' },
      {
        name: '--gog-paginator-ellipsis-color / -ellipsis-font-size',
        description: 'The "…" truncation marker.',
      },
    ],
  },
  {
    id: 'scroll',
    title: 'Scroll',
    tokens: [
      {
        name: '--gog-scroll-track-bg / -track-radius',
        description: 'Track background and corner radius.',
      },
      {
        name: '--gog-scroll-thumb-bg / -thumb-hover-bg / -thumb-active-bg',
        description: 'Draggable thumb color, per interaction state.',
      },
      {
        name: '--gog-scroll-thumb-radius / -thumb-inset',
        description: 'Thumb shape and inset from the track edges.',
      },
      {
        name: '--gog-scroll-corner-bg',
        description: 'Background of the corner square where two tracks meet.',
      },
      { name: '--gog-scroll-fade-duration', description: 'Auto-hide fade animation timing.' },
      {
        name: '--gog-scroll-focus-ring / -focus-ring-width',
        description: 'Keyboard focus ring on the viewport.',
      },
      {
        name: '--gog-scroll-{normal|thin}-track-width / -thumb-min-size',
        description: 'Track width and minimum thumb length, per size step.',
      },
    ],
  },
  {
    id: 'select',
    title: 'Select',
    tokens: [
      { name: '--gog-select-label-color', description: 'Field label color.' },
      {
        name: '--gog-select-field-bg / -field-border',
        description: 'Field surface and border.',
      },
      { name: '--gog-select-radius', description: 'Field corner radius.' },
      { name: '--gog-select-focus-border / -focus-ring', description: 'Focus state.' },
      {
        name: '--gog-select-panel-bg / -panel-shadow',
        description: 'Dropdown panel surface.',
      },
      { name: '--gog-select-chevron-color', description: 'Dropdown arrow color.' },
      {
        name: '--gog-select-option-hover-bg / -option-selected-color',
        description: 'Option row states.',
      },
    ],
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    tokens: [
      { name: '--gog-skeleton-base / -shine', description: 'Placeholder base color and shimmer.' },
      {
        name: '--gog-skeleton-radius / -line-radius',
        description: 'Corner radius, block and line shapes.',
      },
      {
        name: '--gog-skeleton-pulse-duration / -wave-duration',
        description: 'Loading animation timing.',
      },
    ],
  },
  {
    id: 'slider',
    title: 'Slider',
    tokens: [
      { name: '--gog-slider-label-color / -value-color', description: 'Label and current value.' },
      { name: '--gog-slider-track-bg / -fill-bg', description: 'Track, empty and filled.' },
      {
        name: '--gog-slider-thumb-bg / -thumb-border / -thumb-shadow',
        description: 'Drag handle.',
      },
      { name: '--gog-slider-focus-ring', description: 'Keyboard focus ring.' },
    ],
  },
  {
    id: 'spinner',
    title: 'Spinner',
    tokens: [
      { name: '--gog-spinner-track-color', description: 'Background ring.' },
      {
        name: '--gog-spinner-arc-outer-color / -arc-inner-color',
        description: 'Spinning arc colors.',
      },
      {
        name: '--gog-spinner-diamond-color / -rune-color / -glow-color',
        description: 'Decorative elements on the larger spinner variants.',
      },
      {
        name: '--gog-spinner-spin-duration / -pulse-duration',
        description: 'Animation timing.',
      },
    ],
  },
  {
    id: 'table',
    title: 'Table',
    tokens: [
      { name: '--gog-table-border-color / -border-width', description: 'Outer border.' },
      {
        name: '--gog-table-surface / -text-color / -accent-color',
        description: 'Surface, body text and header accent.',
      },
      { name: '--gog-table-hover-bg', description: 'Row hover background.' },
      { name: '--gog-table-muted-color', description: 'Secondary text (e.g. empty state).' },
      {
        name: '--gog-table-header-letter-spacing / -text-transform',
        description: 'Header cell typography.',
      },
      {
        name: '--gog-table-{size}-padding-v / -th-font-size / -td-font-size',
        description: 'Row density, per size step (xsm/sm/md/lg/slg).',
      },
    ],
  },
  {
    id: 'tag',
    title: 'Tag',
    tokens: [
      {
        name: '--gog-tag-default-color / -success-color / -danger-color / -warning-color / -info-color',
        description: 'Base color per semantic variant.',
      },
      {
        name: '--gog-tag-bg-base / -color-base / -bg-mix / -color-mix',
        description: 'How the variant color is mixed into background and text.',
      },
      {
        name: '--gog-tag-radius / -pill-radius',
        description: 'Corner radius, square and pill shape.',
      },
      {
        name: '--gog-tag-{size}-font-size / -padding-block / -padding-inline / -gap / -icon-size',
        description: 'Full sizing scale, per size step (xsm/sm/md/lg/slg).',
      },
    ],
  },
  {
    id: 'toast',
    title: 'Toast',
    tokens: [
      { name: '--gog-toast-bg / -color / -border', description: 'Card surface.' },
      {
        name: '--gog-toast-success-color / -error-color / -warning-color / -info-color',
        description: 'Accent stripe and icon color, per toast type.',
      },
      { name: '--gog-toast-padding / -radius', description: 'Card padding and corner radius.' },
      {
        name: '--gog-toast-stack-peek / -stack-scale-step / -stack-expanded-gap',
        description: 'Card-stack geometry when several toasts are visible at once.',
      },
    ],
  },
];
