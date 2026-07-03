import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly root = this.document.documentElement;
  readonly theme = signal(this.readTheme());

  constructor() {
    this.applyTheme(this.theme());
  }

  setTheme(theme: string): void {
    this.theme.set(theme);
    this.applyTheme(theme);
  }

  toggleTheme(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private readTheme(): string {
    return this.root.getAttribute('data-theme') ?? 'light';
  }

  private applyTheme(theme: string): void {
    this.root.setAttribute('data-theme', theme);
  }
}
