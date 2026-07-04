import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { ButtonComponent, SpinnerComponent } from '@gleks/ui';
import { DIALOG_REF, type DialogRef } from '@gleks/ui';

interface InventorySnapshot {
  location: string;
  batches: number;
  items: number;
  refreshedAt: string;
}

@Component({
  selector: 'app-loading-inventory-dialog',
  imports: [ButtonComponent, SpinnerComponent],
  templateUrl: './loading-inventory-dialog.component.html',
  styleUrl: './loading-inventory-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingInventoryDialogComponent {
  private static count = 0;

  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject<DialogRef<void>>(DIALOG_REF);
  private timerId: ReturnType<typeof setTimeout> | null = null;

  protected readonly instanceId = ++LoadingInventoryDialogComponent.count;
  protected readonly titleId = `inventory-loading-title-${this.instanceId}`;
  protected readonly descriptionId = `inventory-loading-description-${this.instanceId}`;
  protected readonly isLoading = signal(true);
  protected readonly snapshot = signal<InventorySnapshot | null>(null);

  constructor() {
    this.destroyRef.onDestroy(() => this.clearTimer());
    this.loadSnapshot();
  }

  protected close(): void {
    this.dialogRef.close();
  }

  protected reload(): void {
    this.loadSnapshot();
  }

  private loadSnapshot(): void {
    this.clearTimer();
    this.isLoading.set(true);
    this.snapshot.set(null);

    this.timerId = setTimeout(() => {
      this.snapshot.set({
        location: 'Warehouse B / aisle 4',
        batches: 12,
        items: 428,
        refreshedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
      this.isLoading.set(false);
      this.timerId = null;
    }, 1800);
  }

  private clearTimer(): void {
    if (this.timerId === null) return;
    clearTimeout(this.timerId);
    this.timerId = null;
  }
}
