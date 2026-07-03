import { Injectable, TemplateRef, signal } from '@angular/core';
import { GogIconName } from '../../components/icon/icon.component';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  iconName: GogIconName;
  iconTemplate?: TemplateRef<unknown> | null;
  actions: ToastAction[];
  isSticky: boolean;
  duration: number;
  position: ToastPosition;
  dedupeKey: string;
  revision: number;
}

export interface ToastAction {
  label: string;
  onClick: (toast: Toast) => void;
}

export interface ToastConfig {
  message: string;
  type?: ToastType;
  iconName?: GogIconName;
  iconTemplate?: TemplateRef<unknown> | null;
  actions?: ToastAction[];
  dedupeKey?: string;
  isSticky?: boolean;
  duration?: number;
  position?: ToastPosition;
}

const DEFAULT_DURATION = 4000;
const DEFAULT_POSITION: ToastPosition = 'bottom-right';

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  private generateId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  show(config: ToastConfig): string {
    const type = config.type ?? 'info';
    const iconName = config.iconName ?? this.defaultIconName(type);
    const actions = config.actions ?? [];
    const dedupeKey =
      config.dedupeKey ??
      this.buildDedupeKey(
        config.message,
        type,
        iconName,
        config.position ?? DEFAULT_POSITION,
        actions,
        config.iconTemplate ?? null,
      );

    let createdId = this.generateId();

    this.toasts.update((list) => {
      let existingIndex = -1;
      if (dedupeKey) {
        for (let index = list.length - 1; index >= 0; index -= 1) {
          if (list[index].dedupeKey === dedupeKey) {
            existingIndex = index;
            break;
          }
        }
      }
      const nextToast: Toast = {
        id: existingIndex >= 0 ? list[existingIndex].id : createdId,
        message: config.message,
        type,
        iconName,
        iconTemplate: config.iconTemplate ?? null,
        actions,
        isSticky: config.isSticky ?? false,
        duration: config.duration ?? DEFAULT_DURATION,
        position: config.position ?? DEFAULT_POSITION,
        dedupeKey,
        revision: existingIndex >= 0 ? list[existingIndex].revision + 1 : 0,
      };

      if (existingIndex >= 0) {
        const next = [...list];
        next[existingIndex] = nextToast;
        createdId = nextToast.id;
        return next;
      }

      createdId = nextToast.id;
      return [...list, nextToast];
    });

    return createdId;
  }

  dismiss(id: string): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  dismissAll(): void {
    this.toasts.set([]);
  }

  success(message: string, config?: Partial<ToastConfig>): string {
    return this.show({ ...config, message, type: 'success' });
  }

  error(message: string, config?: Partial<ToastConfig>): string {
    return this.show({ ...config, message, type: 'error' });
  }

  warning(message: string, config?: Partial<ToastConfig>): string {
    return this.show({ ...config, message, type: 'warning' });
  }

  info(message: string, config?: Partial<ToastConfig>): string {
    return this.show({ ...config, message, type: 'info' });
  }

  private defaultIconName(type: ToastType): GogIconName {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }

  private buildDedupeKey(
    message: string,
    type: ToastType,
    iconName: GogIconName,
    position: ToastPosition,
    actions: ToastAction[],
    iconTemplate: TemplateRef<unknown> | null,
  ): string {
    if (actions.length > 0) return '';
    return [message, type, iconName, position, iconTemplate ? 'template' : 'default'].join('|');
  }
}
