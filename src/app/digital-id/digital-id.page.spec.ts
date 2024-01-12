import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DigitalIdPage } from './digital-id.page';

describe('DigitalIdPage', () => {
  let component: DigitalIdPage;
  let fixture: ComponentFixture<DigitalIdPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DigitalIdPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DigitalIdPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
