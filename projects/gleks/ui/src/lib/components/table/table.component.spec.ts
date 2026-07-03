import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';

describe('TableComponent', () => {
  let component: TableComponent<object>;
  let fixture: ComponentFixture<TableComponent<object>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should sort rows by the configured field', () => {
    fixture.componentRef.setInput('value', [
      { id: 2, name: 'Bravo' },
      { id: 1, name: 'Alpha' },
    ]);

    component.sortState.set({ field: 'id', direction: 'asc' });

    expect((component.sortedData() as Array<{ id: number; name: string }>).map((row) => row.id)).toEqual([1, 2]);
  });
});
