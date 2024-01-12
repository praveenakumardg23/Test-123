import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BadachNsfMessagesPage } from './badach-nsf-messages.page';

describe('BadachNsfMessagesPage', () => {
  let component: BadachNsfMessagesPage;
  let fixture: ComponentFixture<BadachNsfMessagesPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BadachNsfMessagesPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BadachNsfMessagesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
