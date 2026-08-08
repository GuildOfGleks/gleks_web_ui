# Getting Started

## Install

```bash
npm install @guildofgleks/ui
```

## Import the styles

Add the library stylesheet once, in your app's global styles (`angular.json`):

```json
"styles": [
  "node_modules/@guildofgleks/ui/src/styles/index.css",
  "src/styles.scss"
]
```

## Use a component

Every component is standalone — import only what you use:

```ts
import { Component } from '@angular/core';
import { ButtonComponent } from '@guildofgleks/ui';

@Component({
  selector: 'app-example',
  imports: [ButtonComponent],
  template: `<gog-button variant="primary">Click me</gog-button>`,
})
export class ExampleComponent {}
```

## Set app-wide defaults (optional)

Anything a whole app decides once — a compact size, automatic error timing, a date
format — goes in one place instead of on every instance:

```ts
import { provideGogConfig } from '@guildofgleks/ui';

bootstrapApplication(App, {
  providers: [
    provideGogConfig({
      control: { size: 'sm', errorDisplay: 'auto' },
      datepicker: { locale: 'de-DE', firstDayOfWeek: 1 },
    }),
  ],
});
```

A component's own input always wins over this. See **Global Configuration** for the
full list of keys.

## Next steps

- Browse **Components** in the sidebar for the full catalogue, with every input,
  output and variant a component supports.
- Read **Theming** to adapt colors, spacing and typography to your brand — or to drop
  in one of the ready-made presets.
- Read **Global Configuration** for everything you can set once, app-wide.
