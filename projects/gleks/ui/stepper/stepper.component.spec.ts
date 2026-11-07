import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GOG_CONFIG } from '@guildofgleks/ui/shared';
import { type GogStep, StepperComponent } from './stepper.component';

const STEPS: GogStep[] = [
  { label: 'Account', state: 'complete' },
  { label: 'Address' },
  { label: 'Payment' },
  { label: 'Review' },
];

describe('StepperComponent', () => {
  let fixture: ComponentFixture<StepperComponent>;
  let host: HTMLElement;

  async function render(inputs: Record<string, unknown>, providers: unknown[] = []) {
    await TestBed.configureTestingModule({
      imports: [StepperComponent],
      providers: providers as never[],
    }).compileComponents();
    fixture = TestBed.createComponent(StepperComponent);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    host = fixture.nativeElement;
    await fixture.whenStable();
    fixture.detectChanges();
  }
  const update = async (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    await fixture.whenStable();
    fixture.detectChanges();
  };
  const steps = () => Array.from(host.querySelectorAll<HTMLElement>('.gog-stepper__step'));
  const triggers = () =>
    steps().map((li) => li.querySelector<HTMLElement>('.gog-stepper__trigger')!);
  const buttons = () => triggers().map((el) => el.tagName === 'BUTTON');

  it('is a named ordered list with one item per step', async () => {
    await render({ steps: STEPS, activeIndex: 1 });
    const list = host.querySelector('ol')!;
    expect(list.getAttribute('aria-label')).toBe('Progress');
    expect(steps().length).toBe(4);
  });

  it('marks the current step with aria-current="step", and only that one', async () => {
    await render({ steps: STEPS, activeIndex: 1 });
    expect(triggers().map((el) => el.getAttribute('aria-current'))).toEqual([
      null,
      'step',
      null,
      null,
    ]);
  });

  it('says what the indicator shows, after the label, in words', async () => {
    await render({
      steps: [
        { label: 'Account', state: 'complete' },
        { label: 'Card', state: 'error' },
        { label: 'Done' },
      ],
    });
    const said = triggers().map((el) =>
      el.querySelector('.gog-visually-hidden')?.textContent?.trim(),
    );
    expect(said).toEqual([', completed', ', has an error', undefined]);
    // The number, check or glyph is drawn, not read.
    expect(
      triggers().every(
        (el) => el.querySelector('.gog-stepper__indicator')?.getAttribute('aria-hidden') === 'true',
      ),
    ).toBe(true);
  });

  it('when linear, reaches back always and forward only past complete steps', async () => {
    // Account complete, current Address: Payment waits on Address, Review on both.
    await render({ steps: STEPS, activeIndex: 1 });
    expect(buttons()).toEqual([true, false, false, false]);
  });

  it('lets an optional step be skipped in a linear flow', async () => {
    await render({
      steps: [
        { label: 'Account', state: 'complete' },
        { label: 'Newsletter', optional: true },
        { label: 'Review' },
      ],
      activeIndex: 0,
    });
    expect(buttons()).toEqual([false, true, true]);
    expect(steps()[1].textContent).toContain('Optional');
  });

  it('reaches every step that is not disabled when not linear', async () => {
    await render({
      steps: [...STEPS.slice(0, 3), { label: 'Review', disabled: true }],
      activeIndex: 0,
      linear: false,
    });
    expect(buttons()).toEqual([false, true, true, false]);
  });

  it('moves activeIndex on a press of a reachable step', async () => {
    await render({ steps: STEPS, activeIndex: 1 });
    (triggers()[0] as HTMLButtonElement).click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.activeIndex()).toBe(0);
    expect(triggers()[0].getAttribute('aria-current')).toBe('step');
  });

  it('opens the way forward when the app marks a step complete', async () => {
    await render({ steps: STEPS, activeIndex: 1 });
    await update({
      steps: STEPS.map((step, i) => (i === 1 ? { ...step, state: 'complete' } : step)),
    });
    expect(buttons()).toEqual([true, false, true, false]);
  });

  it('takes its words from GOG_CONFIG.labels', async () => {
    await render(
      {
        steps: [
          { label: 'Konto', state: 'complete' },
          { label: 'Ende', optional: true },
        ],
      },
      [
        {
          provide: GOG_CONFIG,
          useValue: {
            labels: {
              stepper: 'Fortschritt',
              stepCompleted: 'erledigt',
              stepOptional: 'Optional (de)',
            },
          },
        },
      ],
    );
    expect(host.querySelector('ol')!.getAttribute('aria-label')).toBe('Fortschritt');
    expect(triggers()[0].querySelector('.gog-visually-hidden')?.textContent).toContain('erledigt');
    expect(steps()[1].textContent).toContain('Optional (de)');
  });

  it('carries its size and orientation as classes', async () => {
    await render({ steps: STEPS, size: 'lg', orientation: 'vertical' });
    expect(host.classList).toContain('gog-stepper--lg');
    expect(host.classList).toContain('gog-stepper--vertical');
  });
});
