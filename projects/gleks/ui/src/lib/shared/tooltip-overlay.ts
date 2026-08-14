import { ComponentRef, ViewContainerRef } from '@angular/core';
import { scopedOverlayTheme } from './overlay-theme';

import { GogTooltipBubbleComponent } from '../components/tooltip/tooltip-bubble.component';

/**
 * Creates the tooltip bubble on demand and moves it into `document.body`, same reasoning
 * as `GogDropdownOverlay`: a `position: fixed` bubble needs to sit outside whatever
 * `overflow: hidden`/`transform` ancestors the trigger has, or it could get clipped or
 * mispositioned. Built on `ViewContainerRef.createComponent` + relocating the resulting
 * node rather than `GogDropdownOverlay`'s `ApplicationRef` + `TemplateRef` approach,
 * because the bubble's content is dynamic per-directive-instance data (a string or
 * `TemplateRef` set at open time), not a `<ng-template>` declared in some component's own
 * markup — moving the node after `createComponent` is the same portal technique, it just
 * starts from a component type instead of a template.
 */
export class GogTooltipOverlay {
  private componentRef: ComponentRef<GogTooltipBubbleComponent> | null = null;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly document: Document,
  ) {}

  get isAttached(): boolean {
    return this.componentRef !== null;
  }

  get bubbleElement(): HTMLElement | null {
    return (this.componentRef?.location.nativeElement as HTMLElement | undefined) ?? null;
  }

  attach(themeSource: Element | null): ComponentRef<GogTooltipBubbleComponent> {
    this.detach();

    this.componentRef = this.viewContainerRef.createComponent(GogTooltipBubbleComponent);
    const el = this.componentRef.location.nativeElement as HTMLElement;

    // Only for a genuinely scoped theme — see `scopedOverlayTheme`.
    const theme = scopedOverlayTheme(themeSource, this.document.documentElement);
    if (theme) {
      el.setAttribute('data-theme', theme);
    }

    this.document.body.appendChild(el);
    this.componentRef.changeDetectorRef.detectChanges();

    return this.componentRef;
  }

  detach(): void {
    this.componentRef?.destroy();
    this.componentRef = null;
  }
}
