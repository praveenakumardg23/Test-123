import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagePatronsPage } from './manage-patrons.page';

describe('ManagePatronsPage', () => {
  let component: ManagePatronsPage;
  let fixture: ComponentFixture<ManagePatronsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagePatronsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagePatronsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
