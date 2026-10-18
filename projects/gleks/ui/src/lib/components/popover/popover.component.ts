import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  PLATFORM_ID,
  TemplateRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import {
  GOG_FOCUSABLE,
  GogDropdownOverlay,
  gogAriaTarget,
  gogScrolledOutOfView,
  nextGogControlId,
  resolveLengthToken,
  resolveNumberToken,
  scopedOverlayDirection,
  type GogDropdownDirection,
} from '@guildofgleks/ui/shared';
import { ScrollComponent } from '../scroll/scroll.component';
import { resolveMenuPlacement, type GogMenuPlacement } from '../menu/menu-position';

/** Fallback for `--gog-popover-panel-gap` before layout, matching the token's default at density 1. */
const DEFAULT_PANEL_GAP = 4;
/** First-pass size, before the panel exists to be measured. */
const ESTIMATED_SIZE = { width: 280, height: 200 };

/**
 * A panel of anything — text, a list, a small form — anchored to the element that opened it,
 * dismissed by Escape or a press outside.
 *
 * ```html
 * <button gogButton variant="ghost" [gogPopoverTrigger]="details">Details</button>
 *
 * <gog-popover #details ariaLabel="Order details">
 *   <p>Shipped on 3 October.</p>
 * </gog-popover>
 * ```
 *
 * **A non-modal dialog**, which is the difference from `gog-menu`: a menu holds commands and
 * arrows between them; a popover holds content, so it is `role="dialog"`, Tab moves through what
 * is inside it, and focus moving out of it closes it. It does not trap focus or block the page —
 * that is `gog-dialog`.
 *
 * Opening moves focus to the first focusable element inside, or to the panel itself; Escape closes
 * and returns focus to the trigger. Like `gog-menu`, the panel always renders into `<body>`, so no
 * scroller or `overflow: hidden` around the trigger can clip it.
 */
@Component({
  selector: 'gog-popover',
  imports: [ScrollComponent],
  templateUrl: './popover.component.html',
  styleUrl: './popover.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent {
  /** `'auto'` opens above the trigger when there is no room below. */
  readonly direction = input<GogDropdownDirection>('auto');
  /** The dialog's name. Without one, give the panel's first heading an id and pass `ariaLabelledby`. */
  readonly ariaLabel = input('');
  readonly ariaLabelledby = input('');
  readonly gogOpened = output<void>();
  /** Fires after the popover closes, whichever way. */
  readonly gogClosed = output<void>();

  readonly popoverId = nextGogControlId('gog-popover');

  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly injector = inject(Injector);
  private readonly overlay = new GogDropdownOverlay(inject(ApplicationRef), this.document);
  private readonly panelTemplate = viewChild.required<TemplateRef<unknown>>('panelTpl');

  private readonly openState = signal(false);
  readonly isOpen = this.openState.asReadonly();
  private triggerEl: HTMLElement | null = null;

  protected readonly placement = signal<GogMenuPlacement | null>(null);
  protected readonly panelZIndex = signal<number | null>(null);
  /** The room measured on the panel's side of the trigger, capped again by the theme in CSS. */
  protected readonly availableHeight = computed(() => {
    const placement = this.placement();
    return placement ? `${placement.availableHeight}px` : null;
  });

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      const isOpen = this.openState();
      untracked(() => {
        if (!isOpen) {
          this.overlay.detach();
          return;
        }
        if (this.overlay.isAttached) return;
        this.overlay.attach(this.panelTemplate(), this.triggerEl);
        if (this.triggerEl) this.measure(this.triggerEl, this.panelElement());
        this.focusInside();
      });
    });

    // A press anywhere but the panel or its trigger closes it, leaving focus where the press went.
    effect((onCleanup) => {
      if (!this.isBrowser || !this.openState()) return;
      const onPointerDown = (event: Event) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (this.triggerEl?.contains(target) || this.panelElement()?.contains(target)) return;
        this.close(false);
      };
      this.document.addEventListener('pointerdown', onPointerDown, true);
      onCleanup(() => this.document.removeEventListener('pointerdown', onPointerDown, true));
    });

    // Follow the trigger on scroll and resize; once it has scrolled out of sight, close.
    effect((onCleanup) => {
      if (!this.isBrowser || !this.openState()) return;
      let frame: number | null = null;
      const reposition = () => {
        if (frame !== null) return;
        frame = requestAnimationFrame(() => {
          frame = null;
          const trigger = this.triggerEl;
          if (!trigger) return;
          if (gogScrolledOutOfView(trigger)) {
            this.close(false);
            return;
          }
          this.measure(trigger, this.panelElement());
        });
      };
      this.document.addEventListener('scroll', reposition, { passive: true, capture: true });
      window.addEventListener('resize', reposition, { passive: true });
      onCleanup(() => {
        this.document.removeEventListener('scroll', reposition, { capture: true });
        window.removeEventListener('resize', reposition);
        if (frame !== null) cancelAnimationFrame(frame);
      });
    });

    inject(DestroyRef).onDestroy(() => this.overlay.detach());
  }

  /** Opens anchored to `trigger`, and moves focus inside. */
  open(trigger: HTMLElement): void {
    if (!this.isBrowser) return;
    const wasOpen = this.openState();
    this.triggerEl = trigger;
    this.measure(trigger, wasOpen ? this.panelElement() : null);
    this.openState.set(true);
    if (wasOpen) this.focusInside();
    afterNextRender(
      () => {
        if (!this.openState()) return;
        const panel = this.panelElement();
        this.measure(trigger, panel);
        // Content that renders in the same pass as the opening — a list the owner fills as it
        // opens — is not there yet when the panel is attached, so focus may have landed on the
        // panel itself. Now that it has rendered, move it in.
        if (panel && this.document.activeElement === panel) this.focusInside();
      },
      { injector: this.injector },
    );
    if (!wasOpen) this.gogOpened.emit();
  }

  /** Closes and, unless told otherwise, returns focus to the trigger. */
  close(restoreFocus = true): void {
    if (!this.openState()) return;
    this.openState.set(false);
    const trigger = this.triggerEl;
    this.triggerEl = null;
    if (restoreFocus && trigger) gogAriaTarget(trigger).focus({ preventScroll: true });
    this.gogClosed.emit();
  }

  toggle(trigger: HTMLElement): void {
    if (this.openState()) this.close();
    else this.open(trigger);
  }

  /** True while `trigger` is the element this popover is open from. */
  isOpenFrom(trigger: HTMLElement): boolean {
    return this.openState() && this.triggerEl === trigger;
  }

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    this.close();
  }

  /** Focus leaving both the panel and its trigger — Tab past the last element — closes it. */
  protected onPanelFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (!next) return;
    if (this.panelElement()?.contains(next) || this.triggerEl?.contains(next)) return;
    this.close(false);
  }

  private panelElement(): HTMLElement | null {
    return this.document.getElementById(this.popoverId);
  }

  private focusInside(): void {
    const panel = this.panelElement();
    if (!panel) return;
    const first = Array.from(panel.querySelectorAll<HTMLElement>(GOG_FOCUSABLE)).find(
      (element) => !(element as HTMLButtonElement).disabled,
    );
    (first ?? panel).focus({ preventScroll: true });
  }

  private measure(trigger: HTMLElement, panel: HTMLElement | null): void {
    const rect = trigger.getBoundingClientRect();
    const styles = getComputedStyle(trigger);
    const written = scopedOverlayDirection(trigger, this.document.documentElement);
    const direction = written ?? (styles.direction === 'rtl' ? 'rtl' : 'ltr');
    const inheritedZ = styles.getPropertyValue('--gog-dropdown-z').trim();
    this.panelZIndex.set(inheritedZ ? resolveNumberToken(trigger, '--gog-dropdown-z', 0) : null);

    const size = panel ? { width: panel.offsetWidth, height: panel.scrollHeight } : ESTIMATED_SIZE;
    this.placement.set(
      resolveMenuPlacement(
        {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          width: rect.width,
        },
        size,
        { width: window.innerWidth, height: window.innerHeight },
        direction,
        this.direction(),
        resolveLengthToken(trigger, '--gog-popover-panel-gap', DEFAULT_PANEL_GAP),
      ),
    );
  }
}

/**
 * Opens a `gog-popover` from the consumer's own button, and states on it that it does.
 *
 * ```html
 * <button gogButton [gogPopoverTrigger]="details">Details</button>
 * ```
 */
@Directive({
  selector: '[gogPopoverTrigger]',
  host: { '(click)': 'onClick($event)' },
})
export class GogPopoverTriggerDirective {
  readonly popover = input.required<PopoverComponent>({ alias: 'gogPopoverTrigger' });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly isOpen = computed(() => this.popover().isOpenFrom(this.host));

  constructor() {
    // On the element that takes focus, after render: a `gog-button` host has no role of its own.
    afterRenderEffect(() => {
      const target = gogAriaTarget(this.host);
      target.setAttribute('aria-haspopup', 'dialog');
      target.setAttribute('aria-expanded', String(this.isOpen()));
      if (this.isOpen()) target.setAttribute('aria-controls', this.popover().popoverId);
      else target.removeAttribute('aria-controls');
    });
  }

  protected onClick(event: MouseEvent): void {
    event.preventDefault();
    this.popover().toggle(this.host);
  }
}
