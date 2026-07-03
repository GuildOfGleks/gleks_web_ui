import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import {
  ButtonComponent,
  CheckboxComponent,
  ConfirmationDialogComponent,
  DialogComponent,
  DialogService,
  GogMultiselectOption,
  GogSelectOption,
  InputfieldComponent,
  MultiselectComponent,
  SelectComponent,
  ThemeService,
  ToastContainerComponent,
  ToastPosition,
  ToastService,
  ToastType,
} from '@gleks/ui';

@Component({
  selector: 'app-showcase-page',
  imports: [
    CommonModule,
    ButtonComponent,
    CheckboxComponent,
    DialogComponent,
    InputfieldComponent,
    MultiselectComponent,
    SelectComponent,
    ToastContainerComponent,
  ],
  templateUrl: './showcase-page.html',
  styleUrl: './showcase-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowcasePage {
  @ViewChild('fieldIcon', { static: true }) fieldIcon!: TemplateRef<unknown>;
  @ViewChild('toastIcon', { static: true }) toastIcon!: TemplateRef<unknown>;
  @ViewChild('toastActionIcon', { static: true }) toastActionIcon!: TemplateRef<unknown>;
  @ViewChild('chevronIcon', { static: true }) chevronIcon!: TemplateRef<unknown>;
  @ViewChild('checkIcon', { static: true }) checkIcon!: TemplateRef<unknown>;

  private readonly toastService = inject(ToastService);
  private readonly dialogService = inject(DialogService);
  private readonly themeService = inject(ThemeService);

  protected readonly title = signal('Gleks UI Showcase');
  protected readonly themeLabel = computed(() => (this.themeService.theme() === 'dark' ? 'Dark' : 'Light'));
  protected readonly formName = signal('Ada Lovelace');
  protected readonly acceptTerms = signal(true);
  protected readonly framework = signal<string | number | null>('angular');
  protected readonly selectedFeatures = signal<(string | number)[]>(['toast', 'dialog']);
  protected readonly toastMessage = signal('Saved successfully');
  protected readonly toastType = signal<string | number | null>('success');
  protected readonly toastPosition = signal<string | number | null>('bottom-right');
  protected readonly lastDialogResult = signal('No dialog opened yet.');

  protected readonly toastTypes: GogSelectOption[] = [
    { id: 'success', name: 'Success' },
    { id: 'error', name: 'Error' },
    { id: 'warning', name: 'Warning' },
    { id: 'info', name: 'Info' },
  ];

  protected readonly positions: GogSelectOption[] = [
    { id: 'top-left', name: 'Top left' },
    { id: 'top-right', name: 'Top right' },
    { id: 'bottom-left', name: 'Bottom left' },
    { id: 'bottom-right', name: 'Bottom right' },
  ];

  protected readonly frameworks: GogSelectOption[] = [
    { id: 'angular', name: 'Angular' },
    { id: 'react', name: 'React' },
    { id: 'vue', name: 'Vue' },
  ];

  protected readonly features: GogMultiselectOption[] = [
    { id: 'toast', name: 'Toast' },
    { id: 'dialog', name: 'Dialog' },
    { id: 'forms', name: 'Forms' },
    { id: 'table', name: 'Table' },
  ];

  protected readonly featureSummary = computed(() => this.selectedFeatures().join(', '));

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  protected showToast(): void {
    this.toastService.show({
      message: this.toastMessage(),
      type: this.toastType() as ToastType,
      position: this.toastPosition() as ToastPosition,
      iconTemplate: this.toastIcon,
      actions: [
        {
          label: 'Undo',
          iconName: 'close',
          iconTemplate: this.toastActionIcon,
          onClick: () => {
            this.toastService.info('Undo clicked');
          },
        },
      ],
    });
  }

  protected showToastBurst(): void {
    for (let index = 1; index <= 7; index += 1) {
      this.toastService.info(`Queued toast ${index}`, {
        position: 'top-right',
        iconTemplate: this.toastIcon,
      });
    }
  }

  protected openConfirmDialog(): void {
    const ref = this.dialogService.open<boolean>({
      title: 'Delete workspace?',
      component: ConfirmationDialogComponent,
      data: {
        title: 'Delete workspace?',
        description: 'This action removes the demo item from the showcase state.',
        confirmText: 'Delete',
        cancelText: 'Keep it',
      },
      role: 'alertdialog',
      modal: true,
      closable: true,
      draggable: true,
      width: 'min(100%, 34rem)',
    });

    void ref.afterClosed.then((confirmed) => {
      this.lastDialogResult.set(confirmed ? 'Confirmed deletion' : 'Cancelled deletion');
      this.toastService.show({
        message: confirmed ? 'Workspace deleted' : 'Workspace kept',
        type: confirmed ? 'success' : 'info',
        iconTemplate: this.toastIcon,
      });
    });
  }

  protected setSampleData(): void {
    this.formName.set('Grace Hopper');
    this.acceptTerms.set(true);
    this.framework.set('angular');
    this.selectedFeatures.set(['toast', 'dialog', 'forms']);
  }
}
