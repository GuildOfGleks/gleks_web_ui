import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface BundleBar {
  readonly label: string;
  readonly detail: string;
  readonly value: string;
  readonly percent: number;
  readonly emphasis: boolean;
}

// Guild of Gleks UI re-measured 2026-08-22 against @guildofgleks/ui@21.5.1; Material
// (@angular/material@22.1.2 +cdk) and primeng@22.0.0 are unchanged since 2026-08-15.
// `percent` is each bar's share of the largest one (PrimeNG) — keep the three in
// step when the numbers are refreshed, and keep them equal to the figures in
// `public/docs/compare-full.md`, which is where the commands that produced them live.
const BUNDLE_BARS: readonly BundleBar[] = [
  {
    label: 'Guild of Gleks UI',
    detail: 'entire library — 29 components + 2 directives',
    value: '106.9 KB',
    percent: 32,
    emphasis: true,
  },
  {
    label: 'Angular Material',
    detail: 'Button + Select + Dialog + Table only',
    value: '153.5 KB',
    percent: 46,
    emphasis: false,
  },
  {
    label: 'PrimeNG',
    detail: 'Button + Select + Dialog + Table only',
    value: '330.6 KB',
    percent: 100,
    emphasis: false,
  },
];

interface SpecRow {
  readonly label: string;
  readonly gleks: string;
  readonly material: string;
  readonly primeng: string;
}

const SPEC_ROWS: readonly SpecRow[] = [
  { label: 'Components & directives', gleks: '31', material: '~35', primeng: '90+' },
  {
    label: 'Theming',
    gleks: 'Plain CSS variables',
    material: 'Sass mixins / M3 tokens',
    primeng: 'JS preset system',
  },
  {
    // Package counts are what `npm ls --all` adds on top of Angular itself — see the
    // "Dependency depth" section of the full comparison for the exact command and trees.
    label: 'Setup',
    gleks: 'npm install, import, done',
    material: '+ @angular/cdk, theme mixins',
    primeng: '+ 10 packages incl. CDK, a preset',
  },
];

interface GuidanceCard {
  readonly library: string;
  readonly text: string;
}

const GUIDANCE: readonly GuidanceCard[] = [
  {
    library: 'Guild of Gleks UI',
    text: 'You want to ship fast, keep the bundle small, and restyle a component by setting a CSS variable — not by learning a theming API first.',
  },
  {
    library: 'Angular Material',
    text: "You want Google's own design language and a decade of production hardening, and don't mind pulling in the CDK to get there.",
  },
  {
    library: 'PrimeNG',
    text: "Your product needs something this library — or Material — simply doesn't have: rich data grids, charts, org charts, or one of dozens of specialized widgets.",
  },
];

@Component({
  selector: 'app-compare-page',
  imports: [RouterLink],
  templateUrl: './compare-page.html',
  styleUrl: './compare-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComparePage {
  protected readonly bundleBars = BUNDLE_BARS;
  protected readonly specRows = SPEC_ROWS;
  protected readonly guidance = GUIDANCE;
}
