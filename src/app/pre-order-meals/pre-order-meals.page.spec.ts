import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreOrderMealsPage } from './pre-order-meals.page';

describe('PreOrderMealsPage', () => {
  let component: PreOrderMealsPage;
  let fixture: ComponentFixture<PreOrderMealsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreOrderMealsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreOrderMealsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
