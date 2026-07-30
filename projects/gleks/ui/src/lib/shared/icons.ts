import { Component, TemplateRef, computed, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export type GogIconName =
  | 'check'
  | 'close'
  | 'chevron-up'
  | 'chevron-down'
  | 'sort'
  | 'sort-up'
  | 'sort-down'
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'checkbox'
  | 'checkbox-checked';

export const ICON_DEFS: Record<GogIconName, string> = {
  check: `<svg class="gog-icon__svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`,

  close: `<svg class="gog-icon__svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
</svg>`,

  'chevron-up': `<svg class="gog-icon__svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <path d="M4 10L8 6L12 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`,

  'chevron-down': `<svg class="gog-icon__svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <path d="M4 6L8 10L12 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
</svg>`,

  sort: `<svg class="gog-icon__svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <path d="M5 5.5H11M5 8H11M5 10.5H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
</svg>`,

  'sort-up': `<svg class="gog-icon__svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <path d="M8 3L4.5 6.5H11.5L8 3Z" fill="currentColor" />
</svg>`,

  'sort-down': `<svg class="gog-icon__svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <path d="M8 13L11.5 9.5H4.5L8 13Z" fill="currentColor" />
</svg>`,

  success: `<svg class="gog-icon__svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <path d="M3 8.5L6.2 11.7L13 4.9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
</svg>`,

  error: `<svg class="gog-icon__svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
</svg>`,

  warning: `<svg class="gog-icon__svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <path d="M8 3L14 13H2L8 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
  <path d="M8 6V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
</svg>`,

  info: `<svg class="gog-icon__svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5" />
  <path d="M8 7V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  <circle cx="8" cy="5.25" r="0.75" fill="currentColor" />
</svg>`,

  checkbox: `<svg class="gog-icon__svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.5" />
</svg>`,

  'checkbox-checked': `<svg class="gog-icon__svg" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
  <rect x="2.5" y="2.5" width="11" height="11" rx="2" fill="currentColor" stroke="currentColor" stroke-width="1.5" />
  <path d="M4 8L6.75 10.75L12 5.5" stroke="var(--gog-ms-checkbox-checked-color)" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
</svg>`,
};
