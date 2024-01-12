import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePaymentMethodsPage } from './manage-payment-methods.page';

describe('ManagePaymentMethodsPage', () => {
  let component: ManagePaymentMethodsPage;
  let fixture: ComponentFixture<ManagePaymentMethodsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagePaymentMethodsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagePaymentMethodsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
