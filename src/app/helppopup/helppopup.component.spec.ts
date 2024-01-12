import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HelppopupComponent } from './helppopup.component';

describe('HelppopupComponent', () => {
  let component: HelppopupComponent;
  let fixture: ComponentFixture<HelppopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HelppopupComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelppopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
