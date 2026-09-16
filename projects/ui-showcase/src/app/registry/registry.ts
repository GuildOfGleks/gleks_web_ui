import { reflectComponentType, type Type } from '@angular/core';
import * as root from '@guildofgleks/ui';
import * as datepicker from '@guildofgleks/ui/datepicker';
import * as dialog from '@guildofgleks/ui/dialog';
import * as table from '@guildofgleks/ui/table';

import { PAGES } from '../pages/pages';
import { type GogPart, type GogUnit, type GogUnitGroup, GROUP_LABELS, UNITS } from './units';

export interface PartRow {
  readonly kind: GogPart['kind'];
  readonly symbol: string;
  /** Element or attribute selector; `null` for a service. */
  readonly selector: string | null;
  /** Input/output counts, components only — read from the compiled class, never typed. */
  readonly inputs: number | null;
  readonly outputs: number | null;
}

export interface UnitRow {
  readonly unit: GogUnit;
  readonly groupLabel: string;
  /** Whether the rebuilt page exists, i.e. the unit is listed in `PAGES`. */
  readonly page: boolean;
  readonly importPath: string;
  readonly parts: readonly PartRow[];
}

export interface GroupRows {
  readonly group: GogUnitGroup;
  readonly label: string;
  readonly units: readonly UnitRow[];
}

/** The public entry points, by the name `GogUnit.entry` uses. */
export const ENTRY_POINTS: Readonly<Record<GogUnit['entry'], Readonly<Record<string, unknown>>>> = {
  root,
  table,
  datepicker,
  dialog,
};

/**
 * The name a class is exported under. Read from the entry points rather than `type.name`, which a
 * production build minifies.
 */
export function exportName(type: Type<unknown>): string {
  for (const namespace of Object.values(ENTRY_POINTS)) {
    const found = Object.keys(namespace).find((key) => namespace[key] === type);
    if (found) return found;
  }
  throw new Error('A registered class is not exported from any public entry point');
}

export function importPath(entry: GogUnit['entry']): string {
  return entry === 'root' ? '@guildofgleks/ui' : `@guildofgleks/ui/${entry}`;
}

export function describePart(part: GogPart): PartRow {
  const symbol = exportName(part.type);
  if (part.kind === 'component') {
    const mirror = reflectComponentType(part.type);
    if (!mirror) throw new Error(`${symbol} is registered as a component but is not one`);
    return {
      kind: part.kind,
      symbol,
      selector: mirror.selector,
      inputs: mirror.inputs.length,
      outputs: mirror.outputs.length,
    };
  }
  return {
    kind: part.kind,
    symbol,
    selector: part.kind === 'directive' ? part.selector : null,
    inputs: null,
    outputs: null,
  };
}

export function registryByGroup(units: readonly GogUnit[] = UNITS): GroupRows[] {
  return (Object.keys(GROUP_LABELS) as GogUnitGroup[]).map((group) => ({
    group,
    label: GROUP_LABELS[group],
    units: units.filter((unit) => unit.group === group).map(describeUnit),
  }));
}

export function describeUnit(unit: GogUnit): UnitRow {
  return {
    unit,
    groupLabel: GROUP_LABELS[unit.group],
    page: unit.id in PAGES,
    importPath: importPath(unit.entry),
    parts: unit.parts.map(describePart),
  };
}

export function unitById(id: string): GogUnit {
  const unit = UNITS.find((candidate) => candidate.id === id);
  if (!unit) throw new Error(`No registry unit '${id}'`);
  return unit;
}

export interface RegistryCounts {
  readonly units: number;
  readonly components: number;
  readonly directives: number;
  readonly services: number;
}

export function registryCounts(units: readonly GogUnit[] = UNITS): RegistryCounts {
  const parts = units.flatMap((unit) => unit.parts);
  return {
    units: units.length,
    components: parts.filter((part) => part.kind === 'component').length,
    directives: parts.filter((part) => part.kind === 'directive').length,
    services: parts.filter((part) => part.kind === 'service').length,
  };
}
