import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageProfilePage } from './manage-profile.page';

describe('ManageProfilePage', () => {
  let component: ManageProfilePage;
  let fixture: ComponentFixture<ManageProfilePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageProfilePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
