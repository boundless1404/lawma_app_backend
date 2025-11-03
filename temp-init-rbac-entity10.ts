import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/utils-billing/entitties/**/*.entity.ts'],
  synchronize: false,
});

async function initRbacForEntity10() {
  await AppDataSource.initialize();
  
  const entityProfileId = '10';
  
  // Import the service
  const { RbacService } = await import('./src/shared/rbac.service');
  const rbacService = new RbacService(AppDataSource);
  
  console.log('Initializing RBAC for entity profile 10...');
  await rbacService.initializeSystemRbac(entityProfileId);
  console.log('RBAC initialized successfully!');
  
  await AppDataSource.destroy();
}

initRbacForEntity10().catch(console.error);
