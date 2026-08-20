import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  AccordionComponent,
  ButtonComponent,
  CheckboxComponent,
  ChipComponent,
  GogAccordionContentDirective,
  GogAccordionItem,
  GogDropdownOption,
  InputfieldComponent,
  SelectComponent,
  SliderComponent,
  ToastContainerComponent,
  ToastService,
} from '@guildofgleks/ui';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SettingsSection extends GogAccordionItem {
  title: string;
}

@Component({
  selector: 'app-settings-page',
  imports: [
    AccordionComponent,
    ButtonComponent,
    CheckboxComponent,
    ChipComponent,
    GogAccordionContentDirective,
    InputfieldComponent,
    SelectComponent,
    SliderComponent,
    ToastContainerComponent,
  ],
  templateUrl: './settings-page.html',
  styleUrl: './settings-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage implements OnDestroy {
  private readonly toastService = inject(ToastService);

  protected readonly sections: SettingsSection[] = [
    { id: 'profile', title: 'Profile' },
    { id: 'preferences', title: 'Preferences' },
    { id: 'keywords', title: 'Muted keywords' },
  ];

  // Profile
  protected readonly name = signal('Ada Lovelace');
  protected readonly email = signal('ada@example.com');
  protected readonly publicProfile = signal(true);

  protected readonly nameError = computed(() => (this.name().trim() ? '' : 'Name is required.'));
  protected readonly emailError = computed(() => {
    const value = this.email();
    if (!value) return 'Email is required.';
    return EMAIL_PATTERN.test(value) ? '' : 'Enter a valid email address.';
  });

  // Preferences
  protected readonly themeOptions: GogDropdownOption[] = [
    { id: 'system', name: 'Match system' },
    { id: 'light', name: 'Light' },
    { id: 'dark', name: 'Dark' },
  ];
  protected readonly theme = signal<string | number | null>('system');
  protected readonly notificationVolume = signal(60);
  protected readonly betaFeatures = signal(false);

  // Muted keywords
  protected readonly newKeyword = signal('');
  protected readonly mutedKeywords = signal<string[]>(['spoilers', 'politics']);

  protected readonly isValid = computed(() => !this.nameError() && !this.emailError());
  protected readonly saving = signal(false);
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  protected addKeyword(): void {
    const keyword = this.newKeyword().trim().toLowerCase();
    if (!keyword || this.mutedKeywords().includes(keyword)) {
      this.newKeyword.set('');
      return;
    }

    this.mutedKeywords.update((list) => [...list, keyword]);
    this.newKeyword.set('');
  }

  protected removeKeyword(keyword: string): void {
    this.mutedKeywords.update((list) => list.filter((entry) => entry !== keyword));
  }

  protected save(): void {
    if (!this.isValid() || this.saving()) return;

    this.saving.set(true);
    this.saveTimer = setTimeout(() => {
      this.saving.set(false);
      this.saveTimer = null;
      this.toastService.success('Settings saved');
    }, 900);
  }

  ngOnDestroy(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
  }
}
