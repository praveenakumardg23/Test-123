import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalMessagesPage } from './global-messages.page';

describe('GlobalMessagesPage', () => {
  let component: GlobalMessagesPage;
  let fixture: ComponentFixture<GlobalMessagesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalMessagesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalMessagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
