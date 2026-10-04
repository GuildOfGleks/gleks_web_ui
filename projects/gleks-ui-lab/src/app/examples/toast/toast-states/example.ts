import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, Toast, ToastAction, ToastComponent, ToastType } from '@guildofgleks/ui';

const TYPES: ToastType[] = ['success', 'info', 'warning', 'error'];
const ACTIONS: ToastAction[] = [
  { label: 'Undo', onClick: () => undefined },
  { label: 'View', iconName: 'external-link', onClick: () => undefined },
];

/** What ToastService builds from a show() call; written out, because these are placed by hand. */
function toast(id: string, type: ToastType, fields: Partial<Toast>): Toast {
  return {
    id,
    message: 'Report exported.',
    type,
    iconName: type,
    actions: [],
    isSticky: true,
    duration: 4000,
    position: 'bottom-right',
    dedupeKey: '',
    revision: 0,
    ...fields,
  };
}

@Component({
  selector: 'app-example',
  imports: [ButtonComponent, ToastComponent],
  templateUrl: './example.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastStatesExample {
  // Closing a toast hides it; a new generation mounts every one again.
  protected readonly generation = signal(0);
  // Built once: a new object on every change detection would restart each toast's timer.
  protected readonly cells = TYPES.flatMap((type) => [
    { toast: toast(`sticky-${type}`, type, {}), isFront: true },
    { toast: toast(`actions-${type}`, type, { actions: ACTIONS }), isFront: true },
    // Timed but queued behind the front of its stack: the bar stays full and still.
    { toast: toast(`queued-${type}`, type, { isSticky: false }), isFront: false },
  ]);
}
