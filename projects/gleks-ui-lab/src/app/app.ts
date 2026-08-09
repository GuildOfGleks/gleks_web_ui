import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonComponent, ScrollComponent, ThemeService } from '@guildofgleks/ui';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPalette } from '@fortawesome/free-solid-svg-icons';
import { SidebarLeftComponent } from './components/shared/sidebar-left/sidebar-left';
import { TocComponent } from './components/shared/toc/toc';

interface ThemeMenuOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    FaIconComponent,
    ButtonComponent,
    ScrollComponent,
    SidebarLeftComponent,
    TocComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'closeThemeMenu()',
  },
})
export class App {
  private readonly themeService = inject(ThemeService);
  private readonly elRef = inject(ElementRef<HTMLElement>);

  // The first two ship with the library itself; `slate` / `one-*` are its importable presets
  // (see the Theming page); `primeng` / `material` are this site's own look-alikes, declared in
  // styles.scss, for the comparison pages.
  protected readonly themeOptions: ThemeMenuOption[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'slate', label: 'Slate' },
    { value: 'one-dark', label: 'One Dark' },
    { value: 'one-light', label: 'One Light' },
    { value: 'primeng', label: 'PrimeNG' },
    { value: 'material', label: 'Material' },
  ];

  protected readonly activeTheme = computed(() => this.themeService.theme());
  protected readonly isThemeMenuOpen = signal(false);

  protected readonly faPalette = faPalette;

  protected toggleThemeMenu(): void {
    this.isThemeMenuOpen.update((open) => !open);
  }

  protected closeThemeMenu(): void {
    this.isThemeMenuOpen.set(false);
  }

  protected selectTheme(theme: string): void {
    this.themeService.setTheme(theme);
    this.closeThemeMenu();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.isThemeMenuOpen()) return;

    const switcher = this.elRef.nativeElement.querySelector('.theme-switcher');
    if (switcher && !switcher.contains(event.target as Node)) {
      this.closeThemeMenu();
    }
  }
}
