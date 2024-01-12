import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatronDetailPage } from './patron-detail.page';

describe('PatronDetailPage', () => {
  let component: PatronDetailPage;
  let fixture: ComponentFixture<PatronDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatronDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatronDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
