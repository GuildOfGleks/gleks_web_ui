import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import {
  ButtonComponent,
  CheckboxComponent,
  InputfieldComponent,
  ToastContainerComponent,
  ToastService,
} from '@guildofgleks/ui';

type AuthMode = 'login' | 'register' | 'reset';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-onboarding-page',
  imports: [ButtonComponent, CheckboxComponent, InputfieldComponent, ToastContainerComponent],
  templateUrl: './onboarding-page.html',
  styleUrl: './onboarding-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnboardingPage implements OnDestroy {
  private readonly toastService = inject(ToastService);

  protected readonly mode = signal<AuthMode>('login');
  protected readonly submitting = signal(false);
  private submitTimer: ReturnType<typeof setTimeout> | null = null;

  // Shared password visibility
  protected readonly showPassword = signal(false);
  protected readonly passwordFieldType = computed(() => (this.showPassword() ? 'text' : 'password'));

  // Login
  protected readonly loginEmail = signal('');
  protected readonly loginPassword = signal('');
  protected readonly rememberMe = signal(true);
  protected readonly loginAttempted = signal(false);
  protected readonly loginEmailError = computed(() =>
    this.loginAttempted() && !this.loginEmail() ? 'Email is required.' : '',
  );
  protected readonly loginPasswordError = computed(() =>
    this.loginAttempted() && !this.loginPassword() ? 'Password is required.' : '',
  );

  // Register
  protected readonly registerName = signal('');
  protected readonly registerEmail = signal('');
  protected readonly registerPassword = signal('');
  protected readonly registerConfirmPassword = signal('');
  protected readonly acceptTerms = signal(false);
  protected readonly registerAttempted = signal(false);

  protected readonly registerNameError = computed(() =>
    this.registerAttempted() && !this.registerName().trim() ? 'Name is required.' : '',
  );
  protected readonly registerEmailError = computed(() => {
    if (!this.registerAttempted()) return '';
    if (!this.registerEmail()) return 'Email is required.';
    return EMAIL_PATTERN.test(this.registerEmail()) ? '' : 'Enter a valid email address.';
  });
  protected readonly registerPasswordError = computed(() => {
    if (!this.registerAttempted()) return '';
    return this.registerPassword().length >= 8 ? '' : 'Use at least 8 characters.';
  });
  protected readonly registerConfirmError = computed(() => {
    if (!this.registerAttempted()) return '';
    return this.registerConfirmPassword() === this.registerPassword() ? '' : 'Passwords do not match.';
  });
  protected readonly registerTermsError = computed(() =>
    this.registerAttempted() && !this.acceptTerms() ? 'You must accept the terms to continue.' : '',
  );

  // Reset
  protected readonly resetEmail = signal('');
  protected readonly resetAttempted = signal(false);
  protected readonly resetEmailError = computed(() => {
    if (!this.resetAttempted()) return '';
    if (!this.resetEmail()) return 'Email is required.';
    return EMAIL_PATTERN.test(this.resetEmail()) ? '' : 'Enter a valid email address.';
  });

  protected setMode(mode: AuthMode): void {
    this.mode.set(mode);
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected submitLogin(): void {
    this.loginAttempted.set(true);
    if (this.loginEmailError() || this.loginPasswordError() || this.submitting()) return;

    this.runSubmit(() => this.toastService.success(`Welcome back, ${this.loginEmail()}`));
  }

  protected submitRegister(): void {
    this.registerAttempted.set(true);
    if (
      this.registerNameError() ||
      this.registerEmailError() ||
      this.registerPasswordError() ||
      this.registerConfirmError() ||
      this.registerTermsError() ||
      this.submitting()
    ) {
      return;
    }

    this.runSubmit(() => {
      this.toastService.success('Account created — check your inbox to confirm.');
      this.mode.set('login');
      this.loginEmail.set(this.registerEmail());
    });
  }

  protected submitReset(): void {
    this.resetAttempted.set(true);
    if (this.resetEmailError() || this.submitting()) return;

    this.runSubmit(() => {
      this.toastService.info(`If ${this.resetEmail()} exists, a reset link is on its way.`);
      this.mode.set('login');
    });
  }

  private runSubmit(onDone: () => void): void {
    if (this.submitTimer) clearTimeout(this.submitTimer);

    this.submitting.set(true);
    this.submitTimer = setTimeout(() => {
      this.submitting.set(false);
      this.submitTimer = null;
      onDone();
    }, 800);
  }

  ngOnDestroy(): void {
    if (this.submitTimer) {
      clearTimeout(this.submitTimer);
    }
  }
}
