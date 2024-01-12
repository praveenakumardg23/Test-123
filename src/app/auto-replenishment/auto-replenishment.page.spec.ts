import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoReplenishmentPage } from './auto-replenishment.page';

describe('AutoReplenishmentPage', () => {
  let component: AutoReplenishmentPage;
  let fixture: ComponentFixture<AutoReplenishmentPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoReplenishmentPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoReplenishmentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
