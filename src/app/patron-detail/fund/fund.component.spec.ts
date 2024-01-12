import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FundComponent } from './fund.component';

describe('FundComponent', () => {
  let component: FundComponent;
  let fixture: ComponentFixture<FundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FundComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
