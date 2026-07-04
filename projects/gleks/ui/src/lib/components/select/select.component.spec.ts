import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectComponent } from './select.component';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('selects an option from the dropdown', async () => {
    fixture.componentRef.setInput('options', [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    const control = fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement;
    control.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const option = fixture.nativeElement.querySelector('.gog-select__option') as HTMLElement;
    option.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.value()).toBe('a');
    expect(fixture.nativeElement.querySelector('.gog-select__dropdown')).toBeNull();
  });

  it('opens upward when requested', async () => {
    fixture.componentRef.setInput('options', [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ]);
    fixture.componentRef.setInput('dropdownDirection', 'up');
    fixture.detectChanges();
    await fixture.whenStable();

    const control = fixture.nativeElement.querySelector('.gog-select__control') as HTMLButtonElement;
    control.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.gog-select__dropdown')?.classList.contains('gog-select__dropdown--up')).toBe(true);
  });
});
