import { TestBed } from '@angular/core/testing';

import { FundraiserserviceService } from './fundraiserservice.service';

describe('FundraiserserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FundraiserserviceService = TestBed.get(FundraiserserviceService);
    expect(service).toBeTruthy();
  });
});
