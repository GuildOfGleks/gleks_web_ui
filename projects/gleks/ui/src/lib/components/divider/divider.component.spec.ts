import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DividerComponent } from './divider.component';

describe('DividerComponent', () => {
  let component: DividerComponent;
  let fixture: ComponentFixture<DividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DividerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DividerComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to a solid horizontal rule', () => {
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('gog-divider')).toBe(true);
    expect(host.classList.contains('gog-divider--horizontal')).toBe(true);
    expect(host.classList.contains('gog-divider--solid')).toBe(true);
    expect(host.classList.contains('gog-divider--inset')).toBe(false);
  });

  it('should expose itself as a separator with its orientation', () => {
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('role')).toBe('separator');
    expect(host.getAttribute('aria-orientation')).toBe('horizontal');

    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.detectChanges();
    expect(host.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('should map orientation and variant to their classes', () => {
    fixture.componentRef.setInput('orientation', 'vertical');
    fixture.componentRef.setInput('variant', 'dashed');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('gog-divider--vertical')).toBe(true);
    expect(host.classList.contains('gog-divider--dashed')).toBe(true);
    expect(host.classList.contains('gog-divider--horizontal')).toBe(false);
  });

  it('should add the inset class only when asked', () => {
    fixture.componentRef.setInput('inset', true);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).classList.contains('gog-divider--inset')).toBe(
      true,
    );
  });

  it('should always render both rule halves so a label can sit between them', () => {
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelectorAll('.gog-divider__rule').length).toBe(2);
    expect(host.querySelector('.gog-divider__label')).toBeTruthy();
  });
});

@Component({
  imports: [DividerComponent],
  template: `<gog-divider>ИЛИ</gog-divider>`,
})
class LabelledHost {}

describe('DividerComponent — projected label', () => {
  it('should leave the label element empty when nothing is projected, so CSS can collapse it', async () => {
    await TestBed.configureTestingModule({ imports: [DividerComponent] }).compileComponents();
    const fixture = TestBed.createComponent(DividerComponent);
    await fixture.whenStable();
    fixture.detectChanges();

    const label = (fixture.nativeElement as HTMLElement).querySelector('.gog-divider__label');
    // `:empty` is what the stylesheet keys off to close the gap; a stray whitespace text node
    // here would silently leave a notch in the middle of every plain divider.
    expect(label?.childNodes.length).toBe(0);
  });

  it('should put projected content inside the label element', async () => {
    await TestBed.configureTestingModule({ imports: [LabelledHost] }).compileComponents();
    const fixture = TestBed.createComponent(LabelledHost);
    await fixture.whenStable();
    fixture.detectChanges();

    const label = (fixture.nativeElement as HTMLElement).querySelector('.gog-divider__label');
    expect(label?.textContent?.trim()).toBe('ИЛИ');
    expect(label?.childNodes.length).toBeGreaterThan(0);
  });
});
