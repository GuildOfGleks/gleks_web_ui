/**
 * The mask engine: pure functions over strings, no DOM, so it runs on the server and in a table
 * cell as well as under a caret. `docs/input-mask.md` is the specification.
 */

/** A fixed-shape pattern, or several for a value whose length varies (16- and 19-digit cards). */
export type GogMask = string | readonly string[];

/** Extra slot characters, or overrides of the built-in three: `{ H: /[0-9a-f]/i }`. */
export type GogMaskTokens = Readonly<Record<string, RegExp>>;

/** What a masked control hands its form: the slot characters only, or the text as shown. */
export type GogMaskValue = 'raw' | 'formatted';

/** One conformed value. */
export interface GogMaskState {
  /** The text as shown: literals up to the last filled slot. */
  readonly display: string;
  /** The slot characters alone. */
  readonly raw: string;
  /** Every slot of the pattern in use is filled. An empty value is not complete. */
  readonly complete: boolean;
  /** Slots in the pattern in use — what `complete` is measured against. */
  readonly slots: number;
}

/** The built-in slots: a digit, a letter, either. */
export const GOG_MASK_DEFAULT_TOKENS: GogMaskTokens = {
  '0': /\d/,
  a: /\p{L}/u,
  '*': /[\p{L}\d]/u,
};

type MaskPart = { readonly literal: string } | { readonly slot: RegExp };

/** A mask parsed once, reused for every keystroke. */
export interface GogCompiledMask {
  readonly patterns: readonly (readonly MaskPart[])[];
  /** Every slot of every pattern takes digits only — a numeric keyboard is right for it. */
  readonly numeric: boolean;
}

export function compileMask(mask: GogMask, tokens: GogMaskTokens = {}): GogCompiledMask {
  const all = { ...GOG_MASK_DEFAULT_TOKENS, ...tokens };
  const sources = typeof mask === 'string' ? [mask] : [...mask];
  const patterns = sources
    .filter((source) => source.length > 0)
    .map((source) => parse(source, all));
  const slots = patterns.flat().filter((part): part is { slot: RegExp } => 'slot' in part);
  return {
    patterns,
    numeric: slots.length > 0 && slots.every((part) => isDigitsOnly(part.slot)),
  };
}

function parse(source: string, tokens: GogMaskTokens): MaskPart[] {
  const parts: MaskPart[] = [];
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (char === '\\' && i + 1 < source.length) {
      parts.push({ literal: source[++i] });
    } else if (Object.prototype.hasOwnProperty.call(tokens, char)) {
      parts.push({ slot: tokens[char] });
    } else {
      parts.push({ literal: char });
    }
  }
  return parts;
}

/** A slot that takes a digit and no letter — the numeric keyboard is right for it. */
function isDigitsOnly(pattern: RegExp): boolean {
  return test(pattern, '5') && ['a', 'Z', 'x', 'F'].every((char) => !test(pattern, char));
}

/** A `g` or `y` flag makes `test()` stateful; a slot is always asked about one character. */
function test(pattern: RegExp, char: string): boolean {
  pattern.lastIndex = 0;
  return pattern.test(char);
}

/**
 * Conforms `text` to the mask. Typed text (`fromRaw: false`) may contain the pattern's literals,
 * which are accepted at their position; a raw value (`fromRaw: true`) is slot characters only, so
 * a digit is never mistaken for a literal digit such as the `3` of `+38`.
 */
export function conformMask(
  compiled: GogCompiledMask,
  text: string,
  fromRaw = false,
): GogMaskState {
  const { patterns } = compiled;
  if (patterns.length === 0)
    return { display: text, raw: text, complete: text.length > 0, slots: 0 };
  // The first pattern with room for what was typed; the last one when none has.
  for (let i = 0; i < patterns.length - 1; i++) {
    const result = conformTo(patterns[i], text, fromRaw);
    if (!result.overflow) return result.state;
  }
  return conformTo(patterns[patterns.length - 1], text, fromRaw).state;
}

function conformTo(
  parts: readonly MaskPart[],
  text: string,
  fromRaw: boolean,
): { state: GogMaskState; overflow: boolean } {
  const slots = parts.filter((part) => 'slot' in part).length;
  let display = '';
  let raw = '';
  let pending = '';
  let p = 0;
  let i = 0;
  for (; i < text.length && p < parts.length; i++) {
    const char = text[i];
    while (p < parts.length) {
      const part = parts[p];
      if ('literal' in part) {
        pending += part.literal;
        p++;
        if (!fromRaw && char === part.literal) break;
        continue;
      }
      if (test(part.slot, char)) {
        display += pending + char;
        raw += char;
        pending = '';
        p++;
      }
      // A character the slot rejects is dropped, and the slot waits for the next one.
      break;
    }
  }
  // Text left once the pattern ran out is overflow if any of it is more than this pattern's
  // own literals — a trailing space or bracket is not a reason to reach for a longer pattern.
  const literals = new Set(parts.flatMap((part) => ('literal' in part ? [part.literal] : [])));
  const overflow = [...text.slice(i)].some((char) => !literals.has(char));
  return {
    state: { display, raw, complete: slots > 0 && raw.length === slots, slots },
    overflow,
  };
}

/** The index in `display` just after its `count`-th slot character; 0 before the first. */
export function caretAfterSlots(compiled: GogCompiledMask, display: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < display.length; i++) {
    if (isSlotAt(compiled, display, i) && ++seen === count) return i + 1;
  }
  return display.length;
}

/**
 * Whether `display[index]` is a slot character rather than a literal. A conformed display is
 * aligned with its pattern part for part, so the question is the pattern's.
 */
export function isSlotAt(compiled: GogCompiledMask, display: string, index: number): boolean {
  const parts = patternFor(compiled, display);
  const part = parts?.[index];
  return !!part && 'slot' in part;
}

function patternFor(compiled: GogCompiledMask, display: string): readonly MaskPart[] | undefined {
  const { patterns } = compiled;
  for (let i = 0; i < patterns.length - 1; i++) {
    if (!conformTo(patterns[i], display, false).overflow) return patterns[i];
  }
  return patterns[patterns.length - 1];
}

/**
 * Formats a raw value for display — a masked value in a table cell, a summary, an e-mail.
 *
 * ```ts
 * formatMask('0501234567', '+38 (000) 000-00-00'); // '+38 (050) 123-45-67'
 * ```
 */
export function formatMask(value: string, mask: GogMask, tokens?: GogMaskTokens): string {
  return conformMask(compileMask(mask, tokens), value, true).display;
}
