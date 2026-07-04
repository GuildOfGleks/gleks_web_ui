import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiselectComponent } from './multiselect.component';

describe('MultiselectComponent', () => {
  let component: MultiselectComponent;
  let fixture: ComponentFixture<MultiselectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiselectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiselectComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle selection from the native UI', () => {
    fixture.componentRef.setInput('options', [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ]);
    fixture.detectChanges();

    const trigger = fixture.nativeElement.querySelector('.gog-ms') as HTMLElement;
    trigger.click();
    fixture.detectChanges();

    const option = fixture.nativeElement.querySelector('.gog-ms__option') as HTMLButtonElement;
    option.click();
    fixture.detectChanges();

    expect(component.value()).toEqual(['a']);
  });

  it('opens upward when requested', async () => {
    fixture.componentRef.setInput('options', [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ]);
    fixture.componentRef.setInput('dropdownDirection', 'up');
    fixture.detectChanges();
    await fixture.whenStable();

    const trigger = fixture.nativeElement.querySelector('.gog-ms') as HTMLElement;
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.gog-ms__dropdown')?.classList.contains('gog-ms__dropdown--up')).toBe(true);
  });
});
