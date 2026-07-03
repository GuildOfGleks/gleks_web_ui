import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionComponent } from './accordion.component';

describe('AccordionComponent', () => {
  let component: AccordionComponent;
  let fixture: ComponentFixture<AccordionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expand the first item when requested', () => {
    fixture.componentRef.setInput('items', [
      { id: 1, title: 'First' },
      { id: 2, title: 'Second' },
    ]);
    fixture.componentRef.setInput('expandFirst', true);
    fixture.detectChanges();

    expect((component as any).isOpen(1)).toBe(true);
  });
});
