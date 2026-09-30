import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { CheckboxComponent } from '../components/checkbox/checkbox.component';
import { InputfieldComponent } from '../components/inputfield/inputfield.component';
import { SelectComponent } from '../components/select/select.component';
import { provideGogConfig } from '@guildofgleks/ui/shared';

/**
 * Every boolean input takes the attribute form. The template is the first half of the test: under
 * `strictTemplates` a bare `disabled` on an input without a transform is a string and fails to
 * compile, so this file not building is the regression.
 */
@Component({
  imports: [CheckboxComponent, InputfieldComponent, SelectComponent],
  template: `
    <gog-checkbox class="bare" label="Bare" disabled />
    <gog-select class="bare" label="Bare" [options]="options" fullWidth disabled />
    <gog-inputfield class="unset" label="Unset" [(value)]="text" />
    <gog-inputfield class="off" label="Off" clearable="false" [(value)]="text" />
    <gog-inputfield class="on" label="On" clearable [(value)]="text" />
  `,
})
class BooleanAttributeHost {
  readonly options = [{ id: 'a', name: 'Alpha' }];
  readonly text = signal('typed');
}

async function render(providers: unknown[] = []): Promise<ComponentFixture<BooleanAttributeHost>> {
  await TestBed.configureTestingModule({
    imports: [BooleanAttributeHost],
    providers: providers as never,
  }).compileComponents();
  const fixture = TestBed.createComponent(BooleanAttributeHost);
  await fixture.whenStable();
  return fixture;
}

const hasClear = (fixture: ComponentFixture<BooleanAttributeHost>, cls: string) =>
  !!(fixture.nativeElement as HTMLElement).querySelector(
    `gog-inputfield.${cls} [data-gog-part="clear"]`,
  );

describe('boolean inputs in the attribute form', () => {
  it('reads a bare attribute as true', async () => {
    const fixture = await render();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector<HTMLInputElement>('gog-checkbox.bare input')!.disabled).toBe(true);
    expect(root.querySelector<HTMLButtonElement>('gog-select.bare button')!.disabled).toBe(true);
    expect(hasClear(fixture, 'on')).toBe(true);
  });

  it('leaves a configurable input unset without the attribute, so GOG_CONFIG still applies', async () => {
    const fixture = await render([provideGogConfig({ control: { clearable: true } })]);
    expect(hasClear(fixture, 'unset')).toBe(true);
    // The string 'false' is false, and an instance value outranks the config.
    expect(hasClear(fixture, 'off')).toBe(false);
  });

  it('falls back to the component default when neither the attribute nor the config sets it', async () => {
    const fixture = await render();
    expect(hasClear(fixture, 'unset')).toBe(false);
  });
});
