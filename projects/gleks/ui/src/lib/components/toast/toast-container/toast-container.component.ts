import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ToastComponent } from '../toast.component';
import { ToastPosition, ToastService } from '../../../services/toast-service/toast-service';

const POSITIONS: ToastPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

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

  protected trackGroup(_: number, group: { position: ToastPosition }): ToastPosition {
    return group.position;
  }

  protected isLeft(position: ToastPosition): boolean {
    return position.includes('left');
  }

  protected trackToast(_: number, toast: { id: string }): string {
    return toast.id;
  }

  protected dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}
