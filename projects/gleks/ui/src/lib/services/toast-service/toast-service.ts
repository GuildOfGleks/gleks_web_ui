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
  isSticky: boolean;
  duration: number;
  position: ToastPosition;
}

export interface ToastConfig {
  message: string;
  type?: ToastType;
  iconName?: GogIconName;
  iconTemplate?: TemplateRef<unknown> | null;
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
    const id = this.generateId();
    const toast: Toast = {
      id,
      message: config.message,
      type: config.type ?? 'info',
      iconName: config.iconName ?? this.defaultIconName(config.type ?? 'info'),
      iconTemplate: config.iconTemplate ?? null,
      isSticky: config.isSticky ?? false,
      duration: config.duration ?? DEFAULT_DURATION,
      position: config.position ?? DEFAULT_POSITION,
    };

    this.toasts.update((list) => [...list, toast]);
    return id;
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
}
