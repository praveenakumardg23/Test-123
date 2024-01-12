import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundTransferPage } from './fund-transfer.page';

describe('FundTransferPage', () => {
  let component: FundTransferPage;
  let fixture: ComponentFixture<FundTransferPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FundTransferPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundTransferPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
