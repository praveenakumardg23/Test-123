import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoReplenishmentFundComponent } from './auto-replenishment-fund.component';

describe('AutoReplenishmentFundComponent', () => {
  let component: AutoReplenishmentFundComponent;
  let fixture: ComponentFixture<AutoReplenishmentFundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoReplenishmentFundComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoReplenishmentFundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
