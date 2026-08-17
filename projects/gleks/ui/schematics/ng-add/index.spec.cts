import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const collectionPath = path.join(__dirname, '../collection.json');

function workspaceTree(): Tree {
  const tree = Tree.empty();
  tree.create(
    'angular.json',
    JSON.stringify({
      version: 1,
      projects: {
        app: {
          projectType: 'application',
          root: '',
          architect: {
            build: {
              builder: '@angular/build:application',
              options: { styles: ['src/styles.scss'] },
            },
            // The v21 default: no styles of its own, it builds through `buildTarget`.
            test: {
              builder: '@angular/build:unit-test',
              options: { buildTarget: 'app:build' },
            },
          },
        },
        // A karma-based app, whose test target does carry its own styles array.
        'legacy-app': {
          projectType: 'application',
          root: 'projects/legacy-app',
          architect: {
            build: {
              builder: '@angular/build:application',
              options: { styles: [] },
            },
            test: {
              builder: '@angular/build:karma',
              options: { styles: ['src/styles.scss'] },
            },
          },
        },
        'gleks-ui': {
          projectType: 'library',
          root: 'projects/gleks/ui',
          architect: {
            build: { builder: '@angular/build:ng-packagr', options: {} },
          },
        },
      },
    }),
  );
  return tree;
}

test('adds the stylesheet to every application project', async () => {
  const runner = new SchematicTestRunner('gleks-ui', collectionPath);
  const result = await runner.runSchematic('ng-add', {}, workspaceTree());

  const angularJson = JSON.parse(result.readContent('angular.json'));
  assert.deepEqual(angularJson.projects.app.architect.build.options.styles, [
    'node_modules/@guildofgleks/ui/styles/index.css',
    'src/styles.scss',
  ]);
  assert.deepEqual(angularJson.projects['legacy-app'].architect.build.options.styles, [
    'node_modules/@guildofgleks/ui/styles/index.css',
  ]);
});

test('does not duplicate the stylesheet on a second run', async () => {
  const runner = new SchematicTestRunner('gleks-ui', collectionPath);
  const once = await runner.runSchematic('ng-add', {}, workspaceTree());
  const twice = await runner.runSchematic('ng-add', {}, once);

  const angularJson = JSON.parse(twice.readContent('angular.json'));
  assert.deepEqual(angularJson.projects.app.architect.build.options.styles, [
    'node_modules/@guildofgleks/ui/styles/index.css',
    'src/styles.scss',
  ]);
});

test('skips library-type projects when no project option is given', async () => {
  const runner = new SchematicTestRunner('gleks-ui', collectionPath);
  const result = await runner.runSchematic('ng-add', {}, workspaceTree());

  const angularJson = JSON.parse(result.readContent('angular.json'));
  assert.equal(angularJson.projects['gleks-ui'].architect.build.options.styles, undefined);
});

test('leaves a test target that has no styles of its own alone', async () => {
  const runner = new SchematicTestRunner('gleks-ui', collectionPath);
  const result = await runner.runSchematic('ng-add', {}, workspaceTree());

  // `@angular/build:unit-test` rejects an unknown `styles` option outright, and does not need
  // one: it inherits the build target's.
  const angularJson = JSON.parse(result.readContent('angular.json'));
  assert.deepEqual(angularJson.projects.app.architect.test.options, { buildTarget: 'app:build' });
});

test('adds the stylesheet to a karma test target, which has its own styles', async () => {
  const runner = new SchematicTestRunner('gleks-ui', collectionPath);
  const result = await runner.runSchematic('ng-add', {}, workspaceTree());

  const angularJson = JSON.parse(result.readContent('angular.json'));
  assert.deepEqual(angularJson.projects['legacy-app'].architect.test.options.styles, [
    'node_modules/@guildofgleks/ui/styles/index.css',
    'src/styles.scss',
  ]);
});
