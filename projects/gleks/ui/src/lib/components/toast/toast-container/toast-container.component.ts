import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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

  readonly groups = computed(() =>
    POSITIONS.map((position) => ({
      position,
      toasts: this.toastService.toasts().filter((toast) => toast.position === position),
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
