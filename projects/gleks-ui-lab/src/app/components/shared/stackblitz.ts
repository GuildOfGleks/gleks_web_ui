import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ThemeService } from '@guildofgleks/ui';
import sdk from '@stackblitz/sdk';

import { ExampleSource } from './example-sources';
import { LIBRARY_VERSION } from './library-version';

/**
 * Opens a doc-page example as a runnable Angular project on StackBlitz.
 *
 * **Why the SDK and not a repository URL.** `stackblitz.com/github/{user}/{repo}` opens one
 * repository as one project — it cannot give 200-odd examples a playground each, and pointed at
 * this workspace it would install three projects' worth of dependencies and then fail to boot,
 * since Angular has no `defaultProject` and `ng serve` would not know what to serve. The SDK
 * builds a project from files held in memory instead: nothing is committed anywhere, nothing has
 * to be kept in sync, and the project is assembled from the exact source the page is displaying.
 *
 * **The example's files are used verbatim.** An example is three real files on disk — the same
 * three the card's tabs show — so the project is assembled by writing them out under the names
 * the component's own `templateUrl`/`styleUrl` already point at. Nothing is rewritten on the way
 * out, and there is no second copy of any example to keep in step. The handful of snippets across
 * the site that are configuration fragments rather than components are detected by `isRunnable`
 * and simply do not get the button.
 *
 * The project pins **the version this site documents**, so the playground cannot demonstrate API
 * that the reader's install does not have.
 */
@Injectable({ providedIn: 'root' })
export class StackblitzService {
  private readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  /**
   * Whether an example can be booted as-is: a file with imports, a component and an exported
   * class carrying the conventional `app-example` selector. Everything else is a fragment
   * (a `provideGogConfig` call, a dialog options object) with nothing to run.
   */
  isRunnable(source: ExampleSource): boolean {
    return (
      /^import /m.test(source.ts) &&
      source.ts.includes("selector: 'app-example'") &&
      this.bootstrapClass(source.ts) !== null
    );
  }

  open(source: ExampleSource, title?: string | null): void {
    const componentName = this.bootstrapClass(source.ts);
    if (!componentName) return;

    sdk.openProject(
      {
        title: `${title ?? this.titleFromRoute()} — Guild of Gleks UI`,
        description: `Runnable example from https://ui.guildofgleks.com, built against @guildofgleks/ui ${LIBRARY_VERSION}.`,
        template: 'node',
        files: this.files(source, componentName),
      },
      { openFile: 'src/example.html,src/example.ts,src/example.css', newWindow: true },
    );
  }

  /** `/components/radio-group` → `Radio group example`, so tabs are distinguishable at a glance. */
  private titleFromRoute(): string {
    const slug = this.router.url.split(/[?#]/)[0].split('/').filter(Boolean).pop() ?? 'component';
    const name = slug.replace(/-/g, ' ');
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} example`;
  }

  /**
   * The class to bootstrap: the first one declared after the `app-example` selector. One example
   * on the site (the dialog's projected content) declares two components in a single file, and
   * taking the first `export class` would boot the wrong one.
   */
  private bootstrapClass(source: string): string | null {
    const selectorAt = source.indexOf("selector: 'app-example'");
    if (selectorAt === -1) return null;
    return /export class (\w+)/.exec(source.slice(selectorAt))?.[1] ?? null;
  }

  private files(source: ExampleSource, componentName: string): Record<string, string> {
    return {
      'package.json': JSON.stringify(
        {
          name: 'gleks-ui-example',
          private: true,
          scripts: { start: 'ng serve' },
          dependencies: {
            '@angular/common': '^21.2.0',
            '@angular/compiler': '^21.2.0',
            '@angular/core': '^21.2.0',
            '@angular/forms': '^21.2.0',
            '@angular/platform-browser': '^21.2.0',
            '@angular/router': '^21.2.0',
            '@guildofgleks/ui': LIBRARY_VERSION,
            rxjs: '~7.8.0',
            tslib: '^2.3.0',
          },
          devDependencies: {
            '@angular/build': '^21.2.0',
            '@angular/cli': '^21.2.0',
            '@angular/compiler-cli': '^21.2.0',
            typescript: '~5.9.2',
          },
        },
        null,
        2,
      ),

      'angular.json': JSON.stringify(
        {
          $schema: './node_modules/@angular/cli/lib/config/schema.json',
          version: 1,
          projects: {
            example: {
              projectType: 'application',
              root: '',
              sourceRoot: 'src',
              architect: {
                build: {
                  builder: '@angular/build:application',
                  options: {
                    browser: 'src/main.ts',
                    index: 'src/index.html',
                    tsConfig: 'tsconfig.json',
                    styles: ['src/styles.css'],
                  },
                },
                serve: {
                  builder: '@angular/build:dev-server',
                  options: { buildTarget: 'example:build' },
                },
              },
            },
          },
        },
        null,
        2,
      ),

      'tsconfig.json': JSON.stringify(
        {
          compilerOptions: {
            strict: true,
            target: 'ES2022',
            module: 'preserve',
            moduleResolution: 'bundler',
            experimentalDecorators: true,
            skipLibCheck: true,
            types: [],
          },
          files: ['src/main.ts'],
        },
        null,
        2,
      ),

      // A small root around the example rather than bootstrapping it directly, because two of
      // the library's pieces are mounted once per app rather than used inline: `gog-dialog`
      // renders whatever `DialogService` opens, and `gog-toast-container` whatever `ToastService`
      // pushes. Without them the dialog and toast examples would run and show nothing.
      //
      // `provideRouter([])` is here because several examples use `routerLink` on a `[gogButton]`
      // anchor, and an anchor with an unprovided router throws rather than degrading.
      'src/main.ts': [
        "import { Component } from '@angular/core';",
        "import { bootstrapApplication } from '@angular/platform-browser';",
        "import { provideRouter } from '@angular/router';",
        "import { DialogComponent, ToastContainerComponent } from '@guildofgleks/ui';",
        '',
        `import { ${componentName} } from './example';`,
        '',
        '@Component({',
        "  selector: 'app-root',",
        `  imports: [${componentName}, DialogComponent, ToastContainerComponent],`,
        '  template: `',
        '    <app-example />',
        '    <gog-dialog />',
        '    <gog-toast-container />',
        '  `,',
        '})',
        'export class Root {}',
        '',
        'bootstrapApplication(Root, {',
        '  providers: [provideRouter([])],',
        '});',
        '',
      ].join('\n'),

      // The example's own three files, under the names its decorator already points at, so the
      // project runs the exact files the page is displaying — no rewriting of `templateUrl` or
      // `styleUrl` on the way out.
      'src/example.ts': `${source.ts}\n`,
      'src/example.html': `${source.html}\n`,
      'src/example.css': `${source.css}\n`,

      // The reader's current theme travels with them: landing in the light default after reading
      // the docs in One Dark reads as a broken example rather than a different page.
      'src/index.html': [
        '<!doctype html>',
        `<html lang="en" data-theme="${this.theme.theme()}">`,
        '  <head>',
        '    <meta charset="utf-8" />',
        '    <title>Guild of Gleks UI example</title>',
        '    <meta name="viewport" content="width=device-width, initial-scale=1" />',
        '  </head>',
        '  <body style="padding: 24px">',
        '    <app-root></app-root>',
        '  </body>',
        '</html>',
        '',
      ].join('\n'),

      // The presets are imported alongside the base stylesheet so every theme name the docs
      // switcher offers resolves here too — `slate` and the two `one-*` are separate files.
      'src/styles.css': [
        "@import '@guildofgleks/ui/styles/index.css';",
        "@import '@guildofgleks/ui/styles/presets/slate.css';",
        "@import '@guildofgleks/ui/styles/presets/one-dark.css';",
        "@import '@guildofgleks/ui/styles/presets/one-light.css';",
        '',
        'body {',
        '  margin: 0;',
        '  background: var(--gog-background-color);',
        '  color: var(--gog-text-color);',
        '  font-family: var(--gog-font-body);',
        '}',
        '',
      ].join('\n'),
    };
  }
}
