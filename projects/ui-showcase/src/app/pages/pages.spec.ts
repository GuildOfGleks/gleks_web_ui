import { reflectComponentType } from '@angular/core';
import { GOG_TOKEN_GROUPS } from '@guildofgleks/ui';

import { exportName } from '../registry/registry';
import { UNITS } from '../registry/units';
import { PAGES } from './pages';

type Compiled = Partial<
  Record<'ɵdir', { inputs: Record<string, unknown>; outputs: Record<string, string> }>
>;

/** Public input and output names, as a template writes them. */
function compiledApi(type: unknown): { inputs: string[]; outputs: string[] } {
  const mirror = reflectComponentType(type as never);
  if (mirror) {
    return {
      inputs: mirror.inputs.map((input) => input.templateName),
      outputs: mirror.outputs.map((output) => output.templateName),
    };
  }
  const directive = (type as Compiled).ɵdir;
  if (!directive) throw new Error('not a component or directive');
  return { inputs: Object.keys(directive.inputs), outputs: Object.values(directive.outputs) };
}

const sorted = (names: readonly string[]) => [...names].sort();

describe('component pages', () => {
  for (const [id, page] of Object.entries(PAGES)) {
    describe(id, () => {
      const unit = UNITS.find((candidate) => candidate.id === id);

      it('is a registry unit', () => {
        expect(unit).toBeDefined();
      });

      it('documents every component and directive of the unit, in registry order', () => {
        const expected = (unit?.parts ?? [])
          .filter((part) => part.kind !== 'service')
          .map((part) => exportName(part.type));
        expect(page.api.map((api) => exportName(api.type))).toEqual(expected);
      });

      for (const api of page.api) {
        it(`lists exactly the compiled inputs and outputs of ${exportName(api.type)}`, () => {
          const compiled = compiledApi(api.type);
          expect(sorted(api.inputs.map((input) => input.name))).toEqual(sorted(compiled.inputs));
          expect(sorted(api.outputs.map((output) => output.name))).toEqual(
            sorted(compiled.outputs),
          );
        });
      }

      it('names token sections that exist', () => {
        const sections = GOG_TOKEN_GROUPS.map((group) => group.section);
        for (const section of page.tokens) expect(sections).toContain(section);
      });
    });
  }
});
