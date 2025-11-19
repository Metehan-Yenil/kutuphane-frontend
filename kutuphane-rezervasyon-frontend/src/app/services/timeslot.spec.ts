import { TestBed } from '@angular/core/testing';

import { Timeslot } from './timeslot';

describe('Timeslot', () => {
  let service: Timeslot;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Timeslot);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
