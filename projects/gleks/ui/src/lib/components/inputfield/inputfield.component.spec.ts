import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputfieldComponent } from './inputfield.component';

describe('InputfieldComponent', () => {
  let component: InputfieldComponent;
  let fixture: ComponentFixture<InputfieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputfieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputfieldComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update value from the native input', () => {
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'hello';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe('hello');
  });
});
