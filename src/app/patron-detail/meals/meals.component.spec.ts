import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MealsComponent } from './meals.component';

describe('MealsComponent', () => {
  let component: MealsComponent;
  let fixture: ComponentFixture<MealsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MealsComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MealsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
