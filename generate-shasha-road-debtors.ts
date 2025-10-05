import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Database configuration
const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'lawma_app',
  synchronize: false,
  logging: false,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

interface DebtorRecord {
  propertyName: string;
  streetNumber: string;
  streetName: string;
  subscriberName: string;
  phone: string;
  totalBillings: number;
  totalPayments: number;
  outstandingDebt: number;
  lastPaymentDate: string | null;
  monthsWithoutPayment: number;
}

async function generateShashaRoadDebtors() {
  try {
    console.log(
      '🏘️ Generating debtors list for Shasha Road areas (Street IDs: 64, 65, 66, 67)...',
    );
    console.log('📊 Filtering for debts above ₦2,000...');

    // Initialize database connection
    await AppDataSource.initialize();
    console.log('🔌 Database connected');

    // Get properties on specific Shasha Road street IDs
    const query = `
      SELECT DISTINCT
        ps."id" as property_subscription_id,
        ps."subscriberName" as subscriber_name,
        ps."phone" as phone_number,
        ps."propertyName" as property_name,
        ps."streetId" as street_id,
        s."streetName" as street_name,
        w."wardName" as ward_name,
        lga."lgaName" as lga_name,
        st."stateName" as state_name,
        COALESCE(ba."totalBillings", 0) as total_billings,
        COALESCE(ba."totalPayments", 0) as total_payments,
        (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) as debt_amount,
        ba."createdAt" as account_created_date,
        ba."updatedAt" as last_updated
      FROM "propertySubscription" ps
      LEFT JOIN "billingAccount" ba ON ps."id" = ba."propertySubscriptionId"
      LEFT JOIN "street" s ON ps."streetId" = s."id"
      LEFT JOIN "ward" w ON s."wardId" = w."id"
      LEFT JOIN "lga" lga ON w."lgaId" = lga."id"
      LEFT JOIN "state" st ON lga."stateId" = st."id"
      WHERE ps."streetId" IN (64, 65, 66, 67)
        AND (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) > 2000
      ORDER BY debt_amount DESC;
    `;

    console.log('🔍 Executing query...');
    const debtors = await AppDataSource.query(query);

    if (debtors.length === 0) {
      console.log(
        'ℹ️ No debtors found with debt above ₦2,000 for Shasha Road areas',
      );
      return;
    }

    console.log(
      `📋 Found ${debtors.length} debtors with total debt above ₦2,000`,
    );

    // Calculate summary statistics
    const totalDebt = debtors.reduce(
      (sum: number, debtor: any) => sum + parseFloat(debtor.debt_amount),
      0,
    );
    const averageDebt = totalDebt / debtors.length;
    const maxDebt = Math.max(
      ...debtors.map((d: any) => parseFloat(d.debt_amount)),
    );
    const minDebt = Math.min(
      ...debtors.map((d: any) => parseFloat(d.debt_amount)),
    );

    // Generate CSV content
    const timestamp = new Date().toISOString().split('T')[0];
    const csvFilename = `shasha-road-debtors-above-2000-${timestamp}.csv`;
    const csvPath = path.join(__dirname, csvFilename);

    const headers = [
      'Property ID',
      'Subscriber Name',
      'Phone Number',
      'Property Name',
      'Street ID',
      'Street Name',
      'Ward Name',
      'LGA Name',
      'State Name',
      'Total Billings',
      'Total Payments',
      'Outstanding Debt',
      'Account Created',
      'Last Updated',
    ];

    const csvContent = [
      headers.join(','),
      ...debtors.map((debtor: any) =>
        [
          `"${debtor.property_subscription_id || 'N/A'}"`,
          `"${debtor.subscriber_name || 'N/A'}"`,
          `"${debtor.phone_number || 'N/A'}"`,
          `"${debtor.property_name || 'N/A'}"`,
          `"${debtor.street_id || 'N/A'}"`,
          `"${debtor.street_name || 'N/A'}"`,
          `"${debtor.ward_name || 'N/A'}"`,
          `"${debtor.lga_name || 'N/A'}"`,
          `"${debtor.state_name || 'N/A'}"`,
          parseFloat(debtor.total_billings).toFixed(2),
          parseFloat(debtor.total_payments).toFixed(2),
          parseFloat(debtor.debt_amount).toFixed(2),
          `"${debtor.account_created_date || 'N/A'}"`,
          `"${debtor.last_updated || 'N/A'}"`,
        ].join(','),
      ),
    ].join('\n');

    fs.writeFileSync(csvPath, csvContent);
    console.log(`\n💾 CSV file generated: ${csvPath}`);

    // Generate a summary report
    const reportContent = `
SHASHA ROAD DEBTORS REPORT
Generated: ${new Date().toLocaleString()}
Location: Shasha Road, Akowonjo, Alimosho, Lagos
Minimum Debt Threshold: ₦2,000

SUMMARY:
- Total Properties with Debt > ₦2,000: ${debtors.length}
- Total Outstanding Debt: ₦${totalDebt.toLocaleString()}
- Average Debt per Property: ₦${averageDebt.toFixed(2)}
- Highest Individual Debt: ₦${maxDebt.toLocaleString()}
- Lowest Individual Debt: ₦${minDebt.toLocaleString()}

DEBT DISTRIBUTION:
- Debts ₦2,000 - ₦5,000: ${
      debtors.filter((d: any) => parseFloat(d.debt_amount) <= 5000).length
    }
- Debts ₦5,001 - ₦10,000: ${
      debtors.filter(
        (d: any) =>
          parseFloat(d.debt_amount) > 5000 &&
          parseFloat(d.debt_amount) <= 10000,
      ).length
    }
- Debts ₦10,001 - ₦20,000: ${
      debtors.filter(
        (d: any) =>
          parseFloat(d.debt_amount) > 10000 &&
          parseFloat(d.debt_amount) <= 20000,
      ).length
    }
- Debts > ₦20,000: ${
      debtors.filter((d: any) => parseFloat(d.debt_amount) > 20000).length
    }

For complete list, see: ${csvFilename}
    `;

    const reportPath = path.join(
      __dirname,
      `shasha-road-debtors-report-${timestamp}.txt`,
    );
    fs.writeFileSync(reportPath, reportContent);
    console.log(`📋 Report generated: ${reportPath}`);
  } catch (error) {
    console.error('❌ Error generating debtors list:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the function
generateShashaRoadDebtors()
  .then(() => {
    console.log('✅ Debtors generation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to generate debtors:', error);
    process.exit(1);
  });
