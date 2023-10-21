import { Test, TestingModule } from '@nestjs/testing';
import { UtilsBillingService } from './utils-billing.service';

describe('UtilsBillingService', () => {
  let service: UtilsBillingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UtilsBillingService],
    }).compile();

    service = module.get<UtilsBillingService>(UtilsBillingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
