// GENERATED FILE — do not edit by hand.
// Run `npm run generate:examples` after adding or editing an *.example.ts file in this folder.
// See scripts/generate-example-sources.mjs for why the source text is generated rather than imported.

import { ButtonBasicExample } from './button-basic.example';
import { ButtonDebounceExample } from './button-debounce.example';
import { ButtonDisabledExample } from './button-disabled.example';
import { ButtonFormTypeExample } from './button-form-type.example';
import { ButtonFullWidthExample } from './button-full-width.example';
import { ButtonIconOnlyExample } from './button-icon-only.example';
import { ButtonLinkExample } from './button-link.example';
import { ButtonLoadingExample } from './button-loading.example';
import { ButtonVariantsExample } from './button-variants.example';

/** Source text of this folder's examples, keyed by the example component itself. */
export const BUTTON_EXAMPLE_SOURCES: ReadonlyMap<unknown, string> = new Map<unknown, string>([
  [
    ButtonBasicExample,
    "import { ChangeDetectionStrategy, Component, signal } from '@angular/core';\nimport { ButtonComponent } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ButtonComponent],\n  changeDetection: ChangeDetectionStrategy.OnPush,\n  template: `\n    <gog-button variant=\"primary\" (gogClick)=\"onClick()\">Click me</gog-button>\n    <p>{{ status() }}</p>\n  `,\n})\nexport class ButtonBasicExample {\n  protected readonly status = signal('No click yet.');\n\n  protected onClick(): void {\n    this.status.set(`Clicked at ${new Date().toLocaleTimeString()}`);\n  }\n}",
  ],
  [
    ButtonDebounceExample,
    'import { ChangeDetectionStrategy, Component, signal } from \'@angular/core\';\nimport { ButtonComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [ButtonComponent],\n  changeDetection: ChangeDetectionStrategy.OnPush,\n  template: `\n    <!-- Leading-edge throttle: the first click fires immediately, the rest are dropped until\n         "debounce" ms have passed. Default is 300; 1000 here to make it obvious. -->\n    <gog-button variant="primary" [debounce]="1000" (gogClick)="accepted.set(accepted() + 1)">\n      Click me fast\n    </gog-button>\n    <p>Accepted clicks: {{ accepted() }}</p>\n  `,\n})\nexport class ButtonDebounceExample {\n  protected readonly accepted = signal(0);\n}',
  ],
  [
    ButtonDisabledExample,
    "import { ChangeDetectionStrategy, Component } from '@angular/core';\nimport { ButtonComponent, GogVariant } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ButtonComponent],\n  changeDetection: ChangeDetectionStrategy.OnPush,\n  template: `\n    @for (variant of variants; track variant) {\n      <gog-button [variant]=\"variant\" [disabled]=\"true\">{{ variant }}</gog-button>\n    }\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      gap: 12px;\n    }\n  `,\n})\nexport class ButtonDisabledExample {\n  protected readonly variants: GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];\n}",
  ],
  [
    ButtonFormTypeExample,
    'import { ChangeDetectionStrategy, Component, signal } from \'@angular/core\';\nimport { ButtonComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [ButtonComponent],\n  changeDetection: ChangeDetectionStrategy.OnPush,\n  template: `\n    <!-- "type" is forwarded to the native <button>, so the form\'s own submit and reset\n         behaviour works without a click handler. -->\n    <form (submit)="onSubmit($event)" (reset)="result.set(\'Form reset.\')">\n      <gog-button variant="primary" type="submit">Submit</gog-button>\n      <gog-button variant="outline" type="reset">Reset</gog-button>\n    </form>\n    <p>{{ result() }}</p>\n  `,\n  styles: `\n    form {\n      display: flex;\n      gap: 12px;\n    }\n  `,\n})\nexport class ButtonFormTypeExample {\n  protected readonly result = signal(\'Neither button pressed yet.\');\n\n  protected onSubmit(event: Event): void {\n    event.preventDefault();\n    this.result.set(\'Form submitted.\');\n  }\n}',
  ],
  [
    ButtonFullWidthExample,
    'import { ChangeDetectionStrategy, Component } from \'@angular/core\';\nimport { ButtonComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [ButtonComponent],\n  changeDetection: ChangeDetectionStrategy.OnPush,\n  template: `\n    <div class="panel">\n      <gog-button variant="outline" [fullWidth]="true">Full width</gog-button>\n    </div>\n  `,\n  styles: `\n    .panel {\n      max-width: 320px;\n    }\n  `,\n})\nexport class ButtonFullWidthExample {}',
  ],
  [
    ButtonIconOnlyExample,
    'import { ChangeDetectionStrategy, Component } from \'@angular/core\';\nimport { ButtonComponent, IconComponent } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [ButtonComponent, IconComponent],\n  changeDetection: ChangeDetectionStrategy.OnPush,\n  template: `\n    <!-- No visible label, so ariaLabel is required: it lands on the inner <button>, which a\n         plain aria-label attribute on <gog-button> would not. -->\n    <gog-button variant="primary" ariaLabel="Confirm">\n      <gog-icon name="check" />\n    </gog-button>\n    <gog-button variant="outline" ariaLabel="Dismiss">\n      <gog-icon name="close" />\n    </gog-button>\n    <gog-button variant="ghost" size="sm" ariaLabel="More info">\n      <gog-icon name="info" />\n    </gog-button>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      flex-wrap: wrap;\n      gap: 12px;\n    }\n  `,\n})\nexport class ButtonIconOnlyExample {}',
  ],
  [
    ButtonLinkExample,
    'import { ChangeDetectionStrategy, Component } from \'@angular/core\';\nimport { RouterLink } from \'@angular/router\';\nimport { GogButtonDirective } from \'@guildofgleks/ui\';\n\n@Component({\n  selector: \'app-example\',\n  imports: [GogButtonDirective, RouterLink],\n  changeDetection: ChangeDetectionStrategy.OnPush,\n  template: `\n    <!-- The element stays yours; [gogButton] only gives it the look, so routerLink, href,\n         target and download keep working — they were never brokered through an input. -->\n    <a gogButton routerLink="/general/theming">See theming</a>\n    <a\n      gogButton\n      variant="ghost"\n      href="https://www.npmjs.com/package/@guildofgleks/ui"\n      target="_blank"\n      rel="noreferrer"\n      >Package on npm</a\n    >\n    <button gogButton variant="outline" size="sm" type="button">A real button</button>\n  `,\n  styles: `\n    :host {\n      display: flex;\n      align-items: center;\n      flex-wrap: wrap;\n      gap: 12px;\n    }\n  `,\n})\nexport class ButtonLinkExample {}',
  ],
  [
    ButtonLoadingExample,
    "import { ChangeDetectionStrategy, Component, signal } from '@angular/core';\nimport { ButtonComponent } from '@guildofgleks/ui';\n\nconst REQUEST_MS = 1500;\n\n@Component({\n  selector: 'app-example',\n  imports: [ButtonComponent],\n  changeDetection: ChangeDetectionStrategy.OnPush,\n  template: `\n    <gog-button variant=\"primary\" [loading]=\"saving()\" (gogClick)=\"save()\">Save</gog-button>\n    <p>{{ saving() ? 'Saving…' : 'Idle.' }}</p>\n  `,\n})\nexport class ButtonLoadingExample {\n  protected readonly saving = signal(false);\n\n  protected save(): void {\n    // Stands in for the real request. `loading` blocks activation through `aria-disabled`\n    // rather than the native `disabled` attribute, so the button keeps focus while it runs.\n    this.saving.set(true);\n    setTimeout(() => this.saving.set(false), REQUEST_MS);\n  }\n}",
  ],
  [
    ButtonVariantsExample,
    "import { ChangeDetectionStrategy, Component } from '@angular/core';\nimport { ButtonComponent, GogSize, GogVariant } from '@guildofgleks/ui';\n\n@Component({\n  selector: 'app-example',\n  imports: [ButtonComponent],\n  changeDetection: ChangeDetectionStrategy.OnPush,\n  template: `\n    @for (variant of variants; track variant) {\n      <div class=\"row\">\n        <span class=\"row__label\">{{ variant }}</span>\n        @for (size of sizes; track size) {\n          <gog-button [variant]=\"variant\" [size]=\"size\">{{ size }}</gog-button>\n        }\n      </div>\n    }\n  `,\n  styles: `\n    .row {\n      display: flex;\n      align-items: center;\n      flex-wrap: wrap;\n      gap: 12px;\n      margin-bottom: 12px;\n    }\n    .row__label {\n      width: 90px;\n      color: var(--gog-muted-text-color);\n      font-size: var(--gog-text-sm);\n    }\n  `,\n})\nexport class ButtonVariantsExample {\n  protected readonly variants: GogVariant[] = ['primary', 'secondary', 'outline', 'ghost'];\n  protected readonly sizes: GogSize[] = ['xsm', 'sm', 'md', 'lg', 'slg'];\n}",
  ],
]);
