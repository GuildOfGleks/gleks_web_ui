import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import {
  ButtonComponent,
  DIALOG_REF,
  DialogRef,
  ToastService,
} from '@gleks/ui';

export interface WarehouseRegistrationDialogResult {
  registrationCode: string;
  productName: string;
  sku: string;
  category: string;
  supplier: string;
  barcode: string;
  quantity: number;
  unit: string;
  unitCost: number;
  reorderLevel: number;
  warehouseZone: string;
  shelf: string;
  rack: string;
  bin: string;
  receivedAt: string;
  contactName: string;
  contactEmail: string;
  fragile: boolean;
  temperatureControlled: boolean;
  allowBackorder: boolean;
  qualityCheckPassed: boolean;
  notes: string;
}

@Component({
  selector: 'app-warehouse-registration-dialog',
  imports: [ReactiveFormsModule, ButtonComponent],
  templateUrl: './warehouse-registration-dialog.component.html',
  styleUrl: './warehouse-registration-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WarehouseRegistrationDialogComponent {
  private static count = 0;

  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(ToastService);
  private readonly dialogRef = inject<DialogRef<WarehouseRegistrationDialogResult>>(DIALOG_REF);

  protected readonly instanceId = ++WarehouseRegistrationDialogComponent.count;
  protected readonly titleId = `warehouse-registration-title-${this.instanceId}`;
  protected readonly descriptionId = `warehouse-registration-description-${this.instanceId}`;
  protected readonly submitted = signal(false);

  protected readonly categoryOptions = [
    { id: 'hardware', name: 'Hardware' },
    { id: 'packaging', name: 'Packaging' },
    { id: 'consumables', name: 'Consumables' },
    { id: 'spares', name: 'Spare parts' },
  ];

  protected readonly supplierOptions = [
    { id: 'northwind', name: 'Northwind Trading' },
    { id: 'contoso', name: 'Contoso Supply' },
    { id: 'globex', name: 'Globex Logistics' },
    { id: 'fabrikam', name: 'Fabrikam Wholesale' },
  ];

  protected readonly unitOptions = [
    { id: 'piece', name: 'Piece' },
    { id: 'box', name: 'Box' },
    { id: 'crate', name: 'Crate' },
    { id: 'pallet', name: 'Pallet' },
  ];

  protected readonly zoneOptions = [
    { id: 'a-12', name: 'Zone A12' },
    { id: 'b-04', name: 'Zone B04' },
    { id: 'c-08', name: 'Zone C08' },
    { id: 'cold-room', name: 'Cold room' },
  ];

  protected readonly form = this.formBuilder.nonNullable.group({
    registrationCode: [{ value: 'WH-REG-2026-0704-01', disabled: true }],
    productName: ['Industrial label printer', [Validators.required, Validators.minLength(3)]],
    sku: ['PRT-2048', [Validators.required, Validators.pattern(/^[A-Z0-9-]+$/)]],
    category: ['hardware', Validators.required],
    supplier: ['northwind', Validators.required],
    barcode: ['5001234567890', [Validators.required, Validators.pattern(/^\d{8,18}$/)]],
    quantity: [24, [Validators.required, Validators.min(1)]],
    unit: ['box', Validators.required],
    unitCost: [129.5, [Validators.required, Validators.min(0.01)]],
    reorderLevel: [6, [Validators.required, Validators.min(1)]],
    warehouseZone: ['a-12', Validators.required],
    shelf: ['S-03', [Validators.required, Validators.minLength(2)]],
    rack: ['R-08', [Validators.required, Validators.minLength(2)]],
    bin: ['B-14', [Validators.required, Validators.minLength(2)]],
    receivedAt: ['2026-07-04', Validators.required],
    contactName: ['Mila Kovacs', [Validators.required, Validators.minLength(3)]],
    contactEmail: ['mila.kovacs@gleks.example', [Validators.required, Validators.email]],
    fragile: [false],
    temperatureControlled: [false],
    allowBackorder: [true],
    qualityCheckPassed: [true],
    notes: ['Arrived on pallet 4. Keep away from moisture.'],
  });

  protected readonly controls = this.form.controls;

  protected cancel(): void {
    this.dialogRef.close();
  }

  protected save(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value: WarehouseRegistrationDialogResult = this.form.getRawValue();
    this.toastService.show({
      message: `Saved ${value.productName} in ${this.zoneLabel(value.warehouseZone)}`,
      type: 'success',
    });
    this.dialogRef.close(value);
  }

  protected fieldError(control: AbstractControl<unknown>, label: string): string | null {
    if (!(this.submitted() || control.touched) || !control.errors) return null;
    if (control.hasError('required')) return `${label} is required`;
    if (control.hasError('email')) return 'Enter a valid email address';
    if (control.hasError('pattern')) return `${label} has an invalid format`;
    if (control.hasError('minlength')) return `${label} is too short`;

    if (control.hasError('min')) {
      const min = control.errors['min'] as { min?: number } | undefined;
      return `${label} must be at least ${min?.min ?? 0}`;
    }

    return `${label} is invalid`;
  }

  private zoneLabel(id: string): string {
    return this.zoneOptions.find((option) => option.id === id)?.name ?? id;
  }
}
