import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoReplenishmentMealComponent } from './auto-replenishment-meal.component';

describe('AutoReplenishmentMealComponent', () => {
  let component: AutoReplenishmentMealComponent;
  let fixture: ComponentFixture<AutoReplenishmentMealComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoReplenishmentMealComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoReplenishmentMealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
