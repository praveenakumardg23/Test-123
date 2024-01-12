import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UseNewCardPage } from './use-new-card.page';

describe('UseNewCardPage', () => {
  let component: UseNewCardPage;
  let fixture: ComponentFixture<UseNewCardPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UseNewCardPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UseNewCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
