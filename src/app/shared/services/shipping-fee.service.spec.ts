import { TestBed } from '@angular/core/testing';

import { ShippingFeeService } from './shipping-fee.service';

describe('ShippingFeeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ShippingFeeService = TestBed.get(ShippingFeeService);
    expect(service).toBeTruthy();
  });
});
