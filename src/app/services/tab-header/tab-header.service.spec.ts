import { TestBed } from '@angular/core/testing';

import { TabHeaderService } from './tab-header.service';

describe('TabHeaderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TabHeaderService = TestBed.get(TabHeaderService);
    expect(service).toBeTruthy();
  });
});
