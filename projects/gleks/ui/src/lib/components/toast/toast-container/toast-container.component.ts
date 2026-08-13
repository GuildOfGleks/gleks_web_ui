import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ToastComponent } from '../toast.component';
import { Toast, ToastPosition, ToastService } from '../../../services/toast-service/toast-service';

const POSITIONS: ToastPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

/** The two types urgent enough to interrupt whatever the screen reader is currently saying. */
const ASSERTIVE_TYPES = ['error', 'warning'];

/** One line of a live region — see `announcements`. */
interface ToastAnnouncement {
  /** `id` alone is not enough: a deduped toast is re-shown under the same id, and re-announcing
   * it is the point of `revision`. */
  key: string;
  message: string;
}

@Component({
  selector: 'gog-toast-container',
  imports: [ToastComponent],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainerComponent {
  private readonly toastService = inject(ToastService);
  readonly maxVisiblePerPosition = input(5);

  readonly groups = computed(() =>
    POSITIONS.map((position) => ({
      position,
      // Keep the oldest toasts first: they're at the front of the queue (actively ticking),
      // while newer arrivals wait their turn at the back of the visible stack.
      toasts: this.toastService
        .toasts()
        .filter((toast) => toast.position === position)
        .slice(0, Math.max(0, this.maxVisiblePerPosition())),
    })).filter((group) => group.toasts.length > 0),
  );

  /**
   * What the two permanently-mounted live regions in the template say right now, split by
   * urgency. The regions themselves are always in the DOM — that is the whole point of putting
   * them here rather than on `gog-toast`, whose host element only exists from the moment its
   * text does, which is exactly the case screen readers miss.
   *
   * Derived from `groups()` rather than from the raw service state so that what is announced
   * matches what is on screen: a toast queued beyond `maxVisiblePerPosition` is not visible yet
   * and must not be read out yet either.
   */
  protected readonly announcements = computed(() => {
    const visible = this.groups().flatMap((group) => group.toasts);
    return {
      polite: visible.filter((toast) => !ASSERTIVE_TYPES.includes(toast.type)).map(toAnnouncement),
      assertive: visible
        .filter((toast) => ASSERTIVE_TYPES.includes(toast.type))
        .map(toAnnouncement),
    };
  });

  protected trackGroup(_: number, group: { position: ToastPosition }): ToastPosition {
    return group.position;
  }

  protected isLeft(position: ToastPosition): boolean {
    return position.includes('left');
  }

  protected trackToast(_: number, toast: { id: string }): string {
    return toast.id;
  }

  protected trackAnnouncement(_: number, announcement: ToastAnnouncement): string {
    return announcement.key;
  }

  protected dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}

function toAnnouncement(toast: Toast): ToastAnnouncement {
  return { key: `${toast.id}:${toast.revision}`, message: toast.message };
}
