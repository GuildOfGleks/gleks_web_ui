import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ButtonComponent, DIALOG_DATA, DIALOG_REF, DialogRef, GogTagVariant, TagComponent } from '@guildofgleks/ui';

export interface ProductQuickviewData {
  name: string;
  category: string;
  price: number;
  description: string;
  stock: 'in-stock' | 'low-stock' | 'out-of-stock';
  stockLabel: string;
  stockVariant: GogTagVariant;
}

@Component({
  selector: 'app-product-quickview-dialog',
  imports: [ButtonComponent, TagComponent, DecimalPipe],
  templateUrl: './product-quickview-dialog.component.html',
  styleUrl: './product-quickview-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductQuickviewDialogComponent {
  protected readonly data = inject<ProductQuickviewData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<'add-to-cart'>>(DIALOG_REF);

  protected addToCart(): void {
    this.dialogRef.close('add-to-cart');
  }
}
