import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MealRestrictionsPage } from './meal-restrictions.page';

describe('MealRestrictionsPage', () => {
  let component: MealRestrictionsPage;
  let fixture: ComponentFixture<MealRestrictionsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MealRestrictionsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MealRestrictionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
