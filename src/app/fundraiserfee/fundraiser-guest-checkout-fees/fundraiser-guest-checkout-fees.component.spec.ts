import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundraiserGuestCheckoutFeesComponent } from './fundraiser-guest-checkout-fees.component';

describe('FundraiserGuestCheckoutFeesComponent', () => {
  let component: FundraiserGuestCheckoutFeesComponent;
  let fixture: ComponentFixture<FundraiserGuestCheckoutFeesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FundraiserGuestCheckoutFeesComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundraiserGuestCheckoutFeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
