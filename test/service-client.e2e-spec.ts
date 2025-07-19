import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource, Not, IsNull } from 'typeorm';
import { PropertySubscription } from '../src/utils-billing/entitties/propertySubscription.entity';
import { EntitySubscriberProfile } from 'src/utils-billing/entitties/entitySubscriberProfile.entity';

describe('ServiceClientController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let propertyCode: string;
  let phoneNumber: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Find a valid property subscription with a phone number to use for authentication
    const property = await dataSource.manager.findOne(PropertySubscription, {
      where: {
        entitySubscriberProfile: {
          phone: Not(IsNull()),
        },
      },
      relations: ['entitySubscriberProfile'],
    });

    if (!property || !property.entitySubscriberProfile) {
      throw new Error('No suitable test data found in the database.');
    }

    propertyCode = property.id;
    phoneNumber = property.entitySubscriberProfile.phone;

    // Log in as the service client to get a token
    const response = await request(app.getHttpServer())
      .post('/auth/client-signin')
      .send({ propertyCode, phone: phoneNumber });

    authToken = response.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/service-client/dashboard-metrics (GET)', () => {
    it('should return dashboard metrics for an authenticated client', () => {
      return request(app.getHttpServer())
        .get('/service-client/dashboard-metrics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('currentOutstandingBill');
          expect(res.body).toHaveProperty('monthlyPaymentTotals');
          expect(res.body).toHaveProperty('avgMonthlyPayment');
          expect(res.body).toHaveProperty('totalPaidThisYear');
          expect(res.body).toHaveProperty('paymentPerformance');
          expect(res.body.monthlyPaymentTotals).toBeInstanceOf(Array);
        });
    });

    it('should return 401 for an unauthenticated request', () => {
      return request(app.getHttpServer())
        .get('/service-client/dashboard-metrics')
        .expect(401);
    });
  });
});
