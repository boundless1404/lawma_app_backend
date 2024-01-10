// // Generated by CodiumAI

// import { Test, TestingModule } from '@nestjs/testing';
// import { UtilsBillingService } from './utils-billing.service';
// import { bignumber } from 'mathjs';
// import dataSource from '../config/database/connections/default';
// import { PropertySubscriptionUnit } from './entitties/PropertySubscriptionUnit.entity';
// import { Billing } from './entitties/billing.entity';
// import { BillingAccount } from './entitties/billingAccount.entity';
// import { PropertySubscription } from './entitties/propertySubscription.entity';

// describe('generateBilling', () => {
//   // Generates billing for a valid property subscription ID
//   let utilsBillingService: UtilsBillingService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [UtilsBillingService],
//     }).compile();

//     utilsBillingService = module.get<UtilsBillingService>(UtilsBillingService);
//   });

//   it('should generate billing for a valid property subscription ID', async () => {
//     // Arrange
//     // const utilsBillingService = new UtilsBillingService(dbManager, dataSource);
//     const propertySubscriptionId = 'validId';

//     // Mock the necessary dependencies
//     const propertySubscription = { id: propertySubscriptionId };
//     const billingAccount: BillingAccount | Record<string, any> = {};
//     const propertySubscriptionUnits = [
//       {
//         propertyUnits: 2,
//         entitySubscriberProperty: { propertyType: { unitPrice: '10' } },
//       },
//       {
//         propertyUnits: 3,
//         entitySubscriberProperty: { propertyType: { unitPrice: '15' } },
//       },
//     ];
//     const currentBilling = { amount: '65' };

//     utilsBillingService.dbManager.findOne = jest
//       .fn()
//       .mockResolvedValueOnce(propertySubscription)
//       .mockResolvedValueOnce(billingAccount);
//     utilsBillingService.dbManager.find = jest
//       .fn()
//       .mockResolvedValue(propertySubscriptionUnits);
//     utilsBillingService.dbManager.create = jest
//       .fn()
//       .mockReturnValue(currentBilling);
//     utilsBillingService.dbManager.transaction = jest
//       .fn()
//       .mockImplementation(async (callback) => {
//         await callback(utilsBillingService.dbManager);
//       });

//     // Act
//     await utilsBillingService.generateMonthBilling(propertySubscriptionId);

//     // Assert
//     expect(utilsBillingService.dbManager.findOne).toHaveBeenCalledWith(
//       PropertySubscription,
//       {
//         where: { id: propertySubscriptionId },
//       },
//     );
//     expect(utilsBillingService.dbManager.findOne).toHaveBeenCalledWith(
//       BillingAccount,
//       {
//         where: { propertySubscriptionId },
//       },
//     );
//     expect(utilsBillingService.dbManager.find).toHaveBeenCalledWith(
//       PropertySubscriptionUnit,
//       {
//         where: { propertySubscriptionId },
//         relations: { entitySubscriberProperty: { propertyType: true } },
//       },
//     );
//     expect(utilsBillingService.dbManager.create).toHaveBeenCalledWith(Billing, {
//       propertySubscriptionId: propertySubscription.id,
//       month: expect.any(String),
//       year: expect.any(String),
//       amount: currentBilling.amount,
//     });
//     expect(utilsBillingService.dbManager.save).toHaveBeenCalledWith(
//       currentBilling,
//     );
//     expect(bignumber).toHaveBeenCalledWith(billingAccount.totalBillings);
//     expect(bignumber().add).toHaveBeenCalledWith(currentBilling.amount);
//     expect(utilsBillingService.dbManager.save).toHaveBeenCalledWith(
//       billingAccount,
//     );
//   });

//   // Calculates billing amount correctly based on property subscription units and unit price
//   it('should calculate billing amount correctly based on property subscription units and unit price', async () => {
//     // Arrange
//     // const utilsBillingService = new UtilsBillingService(dbManager, dataSource);
//     const propertySubscriptionId = 'validId';

//     // Mock the necessary dependencies
//     const propertySubscription = { id: propertySubscriptionId };
//     const billingAccount = {};
//     const propertySubscriptionUnits = [
//       {
//         propertyUnits: 2,
//         entitySubscriberProperty: { propertyType: { unitPrice: '10' } },
//       },
//       {
//         propertyUnits: 3,
//         entitySubscriberProperty: { propertyType: { unitPrice: '15' } },
//       },
//     ];
//     const currentBilling = { amount: '65' };

//     utilsBillingService.dbManager.findOne = jest
//       .fn()
//       .mockResolvedValueOnce(propertySubscription)
//       .mockResolvedValueOnce(billingAccount);
//     utilsBillingService.dbManager.find = jest
//       .fn()
//       .mockResolvedValue(propertySubscriptionUnits);
//     utilsBillingService.dbManager.create = jest
//       .fn()
//       .mockReturnValue(currentBilling);
//     utilsBillingService.dbManager.transaction = jest
//       .fn()
//       .mockImplementation(async (callback) => {
//         await callback(utilsBillingService.dbManager);
//       });

//     // Act
//     await utilsBillingService.generateMonthBilling(propertySubscriptionId);

//     // Assert
//     expect(utilsBillingService.dbManager.find).toHaveBeenCalledWith(
//       PropertySubscriptionUnit,
//       {
//         where: { propertySubscriptionId },
//         relations: { entitySubscriberProperty: { propertyType: true } },
//       },
//     );
//     expect(bignumber).toHaveBeenCalledWith(0);
//     expect(bignumber().add).toHaveBeenCalledWith(20);
//     expect(bignumber().add).toHaveBeenCalledWith(45);
//   });
// });
