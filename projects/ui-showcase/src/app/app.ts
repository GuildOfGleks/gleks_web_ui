import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonComponent, ThemeService } from '@gleks/ui';

interface ShowcaseNavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly themeService = inject(ThemeService);

  protected readonly title = signal('Gleks UI Showcase');
  protected readonly themeLabel = computed(() => (this.themeService.theme() === 'dark' ? 'Dark' : 'Light'));

  protected readonly navLinks: ShowcaseNavLink[] = [
    { path: 'buttons', label: 'Button' },
    { path: 'checkbox', label: 'Checkbox' },
    { path: 'inputfield', label: 'Inputfield' },
    { path: 'select', label: 'Select' },
    { path: 'multiselect', label: 'Multiselect' },
    { path: 'table', label: 'Table' },
    { path: 'slider', label: 'Slider' },
    { path: 'spinner', label: 'Spinner' },
    { path: 'accordion', label: 'Accordion' },
    { path: 'toast', label: 'Toast' },
    { path: 'tag', label: 'Tag' },
    { path: 'dialog', label: 'Dialog' },
  ];

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
