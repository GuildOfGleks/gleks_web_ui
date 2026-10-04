import { readFileSync } from 'node:fs';

import { reflectComponentType } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { exportName } from '../registry/registry';
import { UNITS } from '../registry/units';
import { SpecimenPage } from './specimen-page';

const DIR = 'projects/ui-showcase/src/app/specimen';

/**
 * Parts a page cannot write twice in its template, each with where the page uses them instead.
 * `pattern` is counted in the page's TypeScript and must match at least twice.
 */
const THROUGH_CODE: Readonly<Record<string, { readonly pattern: RegExp; readonly why: string }>> = {
  DialogComponent: {
    pattern: /this\.confirm\(/g,
    why: 'the one outlet sits in the shell; the page opens a dialog into it from two places',
  },
  ConfirmationDialogComponent: {
    pattern: /this\.confirm\(/g,
    why: 'opened through DialogService, never written in a template',
  },
  ToastContainerComponent: {
    pattern: /this\.toasts\.\w+\(/g,
    why: 'the one outlet sits in the shell; the page fires toasts into it',
  },
  ToastComponent: {
    pattern: /this\.toasts\.\w+\(/g,
    why: 'the container renders one per ToastService entry',
  },
};

/** `'a[gogButton], button[gogButton]'` → `['gogButton']`; `'gog-column'` → `['<gog-column']`. */
function needles(selector: string): string[] {
  const found = new Set<string>();
  for (const simple of selector.split(',').map((part) => part.trim())) {
    const attribute = /\[([\w-]+)\]/.exec(simple);
    found.add(attribute ? attribute[1] : `<${simple}`);
  }
  return [...found];
}

/**
 * Occurrences in a template of an element (`<gog-x`) or an attribute (`gogX`, `[gogX]`, and the
 * structural `*gogX`).
 */
function count(template: string, needle: string): number {
  const pattern = needle.startsWith('<')
    ? new RegExp(`${needle}(?=[\\s/>])`, 'g')
    : new RegExp(`(?<=\\s)[[*]?${needle}\\]?(?=[\\s=>/])`, 'g');
  return template.match(pattern)?.length ?? 0;
}

describe('specimen page', () => {
  const template = readFileSync(`${DIR}/specimen-page.html`, 'utf8');
  const code = readFileSync(`${DIR}/specimen-page.ts`, 'utf8');

  for (const unit of UNITS) {
    for (const part of unit.parts) {
      const name = exportName(part.type);

      it(`uses ${name} at least twice`, () => {
        if (part.kind === 'service') {
          expect(code, name).toContain(`inject(${name})`);
          return;
        }
        const exception = THROUGH_CODE[name];
        if (exception) {
          expect(code.match(exception.pattern)?.length ?? 0, exception.why).toBeGreaterThanOrEqual(
            2,
          );
          return;
        }
        const selector =
          part.kind === 'component' ? reflectComponentType(part.type)?.selector : part.selector;
        const uses = needles(selector ?? '').reduce(
          (sum, needle) => sum + count(template, needle),
          0,
        );
        expect(uses, `${name} (${selector})`).toBeGreaterThanOrEqual(2);
      });
    }
  }

  it('renders', async () => {
    const fixture = TestBed.createComponent(SpecimenPage);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('gog-panel')).toHaveLength(2);
    expect(host.querySelectorAll('gog-button').length).toBeGreaterThan(2);
  });
});
