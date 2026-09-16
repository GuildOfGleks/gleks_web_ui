import { ENTRY_POINTS, exportName, registryByGroup } from './registry';
import { UNITS } from './units';

/**
 * Exported classes Angular compiled that deliberately have no documentation unit.
 * Each needs a reason; anything else exported must belong to a unit, or this spec fails.
 */
const NOT_DOCUMENTED: Readonly<Record<string, string>> = {
  GogDropdownBase: 'abstract base the three dropdowns extend; not used in a template',
};

type Compiled = Partial<Record<'ɵcmp' | 'ɵdir' | 'ɵprov', { selectors?: unknown[][] }>>;

/** Every export Angular compiled as a component, directive or injectable, by export name. */
function compiledExports(): Map<string, unknown> {
  const found = new Map<string, unknown>();
  for (const namespace of Object.values(ENTRY_POINTS)) {
    for (const [name, value] of Object.entries(namespace)) {
      if (typeof value !== 'function') continue;
      const compiled = value as Compiled;
      if (compiled.ɵcmp || compiled.ɵdir || compiled.ɵprov) found.set(name, value);
    }
  }
  return found;
}

/** `[['a', 'gogButton', ''], ['button', 'gogButton', '']]` → `'a[gogButton], button[gogButton]'`. */
function selectorText(selectors: unknown[][]): string {
  return selectors
    .map(([tag, ...rest]) => {
      let text = String(tag);
      for (let i = 0; i + 1 < rest.length && typeof rest[i] === 'string'; i += 2) {
        text += `[${String(rest[i])}]`;
      }
      return text;
    })
    .join(', ');
}

describe('showcase registry', () => {
  const registered = UNITS.flatMap((unit) => unit.parts.map((part) => part.type));

  it('gives every compiled public export exactly one unit, or a reason it has none', () => {
    const missing: string[] = [];
    for (const [name, type] of compiledExports()) {
      const owners = registered.filter((candidate) => candidate === type).length;
      if (name in NOT_DOCUMENTED) {
        expect(owners, `${name} is in NOT_DOCUMENTED but also registered`).toBe(0);
      } else if (owners !== 1) {
        missing.push(`${name} (${owners} units)`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('keeps NOT_DOCUMENTED to names that are still exported', () => {
    const exported = compiledExports();
    for (const name of Object.keys(NOT_DOCUMENTED)) expect(exported.has(name), name).toBe(true);
  });

  it('imports each unit from the entry point it names', () => {
    for (const unit of UNITS) {
      const namespace = ENTRY_POINTS[unit.entry];
      for (const part of unit.parts) {
        expect(Object.values(namespace), `${unit.id}: ${exportName(part.type)}`).toContain(
          part.type,
        );
      }
    }
  });

  it('matches every hand-written directive selector to the compiled one', () => {
    for (const unit of UNITS) {
      for (const part of unit.parts) {
        if (part.kind !== 'directive') continue;
        const compiled = (part.type as Compiled).ɵdir;
        expect(compiled, `${exportName(part.type)} is not a directive`).toBeDefined();
        expect(selectorText(compiled?.selectors ?? [])).toBe(part.selector);
      }
    }
  });

  it('registers services as injectables and components as components', () => {
    for (const unit of UNITS) {
      for (const part of unit.parts) {
        const compiled = part.type as Compiled;
        if (part.kind === 'service') expect(compiled.ɵprov, unit.id).toBeDefined();
        if (part.kind === 'component') expect(compiled.ɵcmp, unit.id).toBeDefined();
      }
    }
  });

  it('uses unique ids', () => {
    const ids = UNITS.map((unit) => unit.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('describes every unit without throwing', () => {
    expect(registryByGroup().flatMap((group) => group.units)).toHaveLength(UNITS.length);
  });
});
