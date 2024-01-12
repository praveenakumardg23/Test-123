import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MealReportsComponent } from './meal-reports.component';

describe('MealReportsComponent', () => {
  let component: MealReportsComponent;
  let fixture: ComponentFixture<MealReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MealReportsComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MealReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
