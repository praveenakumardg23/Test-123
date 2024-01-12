import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoReplenishmentTermsPage } from './auto-replenishment-terms.page';

describe('AutoReplenishmentTermsPage', () => {
  let component: AutoReplenishmentTermsPage;
  let fixture: ComponentFixture<AutoReplenishmentTermsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AutoReplenishmentTermsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoReplenishmentTermsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
