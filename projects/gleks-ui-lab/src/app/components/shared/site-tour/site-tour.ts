import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DialogService } from '@guildofgleks/ui/dialog';

const STORAGE_KEY = 'gog-lab-site-tour';

/** What the tour's dialog resolves with: finished all four steps, or chose to skip them. */
export type SiteTourResult = 'finished' | 'skipped';

/**
 * The four-step tour of the site, shown once to a first-time reader.
 *
 * It stops appearing once the reader finishes it **or** presses "Skip tour" — both are an answer.
 * Closing it any other way (the close button, Escape, the backdrop) is not, so it comes back on the
 * next visit. The footer's "Site tour" opens it again on demand.
 *
 * The dialog's component is imported on demand, so the tour costs the initial bundle only this
 * service; a reader who has seen it never downloads the rest.
 */
@Injectable({ providedIn: 'root' })
export class SiteTour {
  private readonly dialogService = inject(DialogService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private opening = false;

  /** Opens the tour unless this device has already finished or skipped it. Browser only. */
  showIfNew(): void {
    if (!this.isBrowser || readAnswered()) return;
    void this.open();
  }

  async open(): Promise<void> {
    if (!this.isBrowser || this.opening) return;
    this.opening = true;
    try {
      const { SiteTourDialog, SITE_TOUR_TITLE_ID } = await import('./site-tour-dialog');
      const handle = this.dialogService.open<SiteTourResult>({
        component: SiteTourDialog,
        ariaLabelledBy: SITE_TOUR_TITLE_ID,
        closable: true,
        draggable: false,
        width: '640px',
        maxWidth: 'calc(100vw - 32px)',
      });
      const result = await handle.afterClosed;
      if (result) writeAnswered();
    } finally {
      this.opening = false;
    }
  }
}

function readAnswered(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    // Storage blocked: showing it on every visit would be worse than not showing it at all.
    return true;
  }
}

function writeAnswered(): void {
  try {
    localStorage.setItem(STORAGE_KEY, 'done');
  } catch {
    // Private mode: answered for this session only.
  }
}
