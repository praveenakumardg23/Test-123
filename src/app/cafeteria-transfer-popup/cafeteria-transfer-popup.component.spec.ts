import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CafeteriaTransferPopupComponent } from './cafeteria-transfer-popup.component';

describe('CafeteriaTransferPopupComponent', () => {
  let component: CafeteriaTransferPopupComponent;
  let fixture: ComponentFixture<CafeteriaTransferPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CafeteriaTransferPopupComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CafeteriaTransferPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
