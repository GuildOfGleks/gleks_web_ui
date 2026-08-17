// `@angular-devkit/schematics` and `@schematics/angular` are deliberately NOT dependencies of the
// published package: this file only ever runs under `ng add`, which means inside an Angular CLI
// workspace, and `@angular/cli` already depends on both. Declaring them would make every consumer
// of `npm install @guildofgleks/ui` install them too. They live in the workspace's
// devDependencies, which is what compiles and tests this file. Same arrangement as @angular/cdk.
import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { updateWorkspace } from '@schematics/angular/utility/workspace';
import type { Schema } from './schema.cjs';

const STYLE_PATH = 'node_modules/@guildofgleks/ui/styles/index.css';

export function ngAdd(options: Schema): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    return updateWorkspace((workspace) => {
      const projectNames = options.project
        ? [options.project]
        : [...workspace.projects.keys()].filter(
            (name) => workspace.projects.get(name)?.extensions['projectType'] === 'application',
          );

      if (projectNames.length === 0) {
        context.logger.warn(
          `@guildofgleks/ui: no application project found to add "${STYLE_PATH}" to. ` +
            "Add it to your project's styles array yourself.",
        );
      }

      let added = false;

      for (const name of projectNames) {
        const project = workspace.projects.get(name);
        const build = project?.targets.get('build');
        if (!build) {
          if (options.project) {
            context.logger.warn(
              `@guildofgleks/ui: project "${name}" has no "build" target — skipping the styles setup.`,
            );
          }
          continue;
        }

        build.options ??= {};
        added = prependStyle(build.options) || added;

        // `@angular/build:unit-test`, the v21 default, has no `styles` of its own — it builds
        // through `buildTarget`, so the line above already covers component tests. The karma
        // builders do carry their own array, and there the build target's styles are not read.
        // Only touch the test target when it already declares one: adding the key to a builder
        // whose schema forbids it would make `ng test` fail schema validation.
        const test = project?.targets.get('test');
        if (test?.options && Array.isArray(test.options['styles'])) {
          added = prependStyle(test.options) || added;
        }
      }

      // Only say so when something actually changed — a re-run that finds the stylesheet already
      // there, or a workspace where no project could be updated, should not claim otherwise.
      if (added) {
        context.logger.info(
          "@guildofgleks/ui: added the baseline stylesheet to your project's styles. Next: import " +
            'the standalone components you use, and if you use dialogs or toasts, add ' +
            '<gog-dialog /> and <gog-toast-container /> once in your root component. See ' +
            'https://ui.guildofgleks.com for details.',
        );
      }
    });
  };
}

/**
 * Puts the baseline stylesheet first in a target's `styles`, so anything the consumer already had
 * still comes after it and wins. Returns whether it changed anything — a second `ng add` must be
 * a no-op.
 */
function prependStyle(options: Record<string, unknown>): boolean {
  const existing = options['styles'];
  const styles = Array.isArray(existing) ? existing : [];
  if (styles.includes(STYLE_PATH)) {
    return false;
  }

  options['styles'] = [STYLE_PATH, ...styles];

  return true;
}
