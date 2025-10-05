import { createConnection } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

// Database connection configuration
async function createDatabaseConnection() {
  return createConnection({
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
}

async function generateShashaRoadDebtors() {
  try {
    console.log(
      '🔍 Generating debtors list for Shasha Road areas (Street IDs: 64, 65, 66, 67)...',
    );
    console.log('📊 Filtering for debts above ₦2,000\n');

    // Connect to database
    const connection = await createDatabaseConnection();

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

    console.log('🔄 Executing query...\n');

    const debtors = await connection.query(query);

    if (debtors.length === 0) {
      console.log(
        '❌ No debtors found with debt > ₦2,000 on the specified streets.',
      );
      await connection.close();
      return;
    }

    console.log(`✅ Found ${debtors.length} debtors with debt > ₦2,000\n`);

    // Display results
    console.log('📋 DEBTORS LIST:');
    console.log('================');

    debtors.forEach((debtor: any, index: number) => {
      console.log(`${index + 1}. ${debtor.subscriber_name || 'Unknown'}`);
      console.log(`   Property: ${debtor.property_name || 'N/A'}`);
      console.log(
        `   Street: ${debtor.street_name || 'N/A'} (ID: ${debtor.street_id})`,
      );
      console.log(`   Ward: ${debtor.ward_name || 'N/A'}`);
      console.log(`   Phone: ${debtor.phone_number || 'N/A'}`);
      console.log(
        `   Total Billings: ₦${parseFloat(
          debtor.total_billings,
        ).toLocaleString()}`,
      );
      console.log(
        `   Total Payments: ₦${parseFloat(
          debtor.total_payments,
        ).toLocaleString()}`,
      );
      console.log(
        `   Outstanding Debt: ₦${parseFloat(
          debtor.debt_amount,
        ).toLocaleString()}`,
      );
      console.log('   ' + '-'.repeat(50));
    });

    // Generate CSV export
    const timestamp = new Date().toISOString().split('T')[0];
    const csvFilename = `shasha-road-debtors-${timestamp}.csv`;
    const csvPath = path.join(__dirname, csvFilename);

    const csvHeaders = [
      'Property ID',
      'Subscriber Name',
      'Phone Number',
      'Property Name',
      'Street ID',
      'Street Name',
      'Ward',
      'LGA',
      'State',
      'Total Billings',
      'Total Payments',
      'Outstanding Debt',
      'Account Created',
      'Last Updated',
    ];

    const csvContent = [
      csvHeaders.join(','),
      ...debtors.map((debtor: any) =>
        [
          debtor.property_subscription_id,
          `"${debtor.subscriber_name || 'N/A'}"`,
          `"${debtor.phone_number || 'N/A'}"`,
          `"${debtor.property_name || 'N/A'}"`,
          debtor.street_id,
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

    // Generate summary statistics
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

    console.log('\n📊 SUMMARY STATISTICS:');
    console.log('=======================');
    console.log(`- Total Properties with Debt > ₦2,000: ${debtors.length}`);
    console.log(`- Total Outstanding Debt: ₦${totalDebt.toLocaleString()}`);
    console.log(`- Average Debt per Property: ₦${averageDebt.toFixed(2)}`);
    console.log(`- Highest Individual Debt: ₦${maxDebt.toLocaleString()}`);
    console.log(`- Lowest Individual Debt: ₦${minDebt.toLocaleString()}`);

    console.log('\n📈 DEBT DISTRIBUTION:');
    console.log(
      `- Debts ₦2,000 - ₦5,000: ${
        debtors.filter((d: any) => parseFloat(d.debt_amount) <= 5000).length
      }`,
    );
    console.log(
      `- Debts ₦5,001 - ₦10,000: ${
        debtors.filter(
          (d: any) =>
            parseFloat(d.debt_amount) > 5000 &&
            parseFloat(d.debt_amount) <= 10000,
        ).length
      }`,
    );
    console.log(
      `- Debts ₦10,001 - ₦20,000: ${
        debtors.filter(
          (d: any) =>
            parseFloat(d.debt_amount) > 10000 &&
            parseFloat(d.debt_amount) <= 20000,
        ).length
      }`,
    );
    console.log(
      `- Debts > ₦20,000: ${
        debtors.filter((d: any) => parseFloat(d.debt_amount) > 20000).length
      }`,
    );

    console.log(`\nFor complete list, see: ${csvFilename}`);

    // Generate a detailed report file
    const reportPath = path.join(
      __dirname,
      `shasha-road-debtors-report-${timestamp}.txt`,
    );
    const reportContent = `
SHASHA ROAD DEBTORS REPORT
=========================
Generated: ${new Date().toLocaleString()}
Street IDs: 64, 65, 66, 67
Minimum Debt Threshold: ₦2,000

SUMMARY:
- Total Properties with Debt > ₦2,000: ${debtors.length}
- Total Outstanding Debt: ₦${totalDebt.toLocaleString()}
- Average Debt per Property: ₦${averageDebt.toFixed(2)}
- Highest Individual Debt: ₦${maxDebt.toLocaleString()}
- Lowest Individual Debt: ₦${minDebt.toLocaleString()}

DETAILED LIST:
${debtors
  .map(
    (debtor: any, index: number) => `
${index + 1}. ${debtor.subscriber_name || 'Unknown'}
   Property: ${debtor.property_name || 'N/A'}
   Street: ${debtor.street_name || 'N/A'} (ID: ${debtor.street_id})
   Ward: ${debtor.ward_name || 'N/A'}
   Phone: ${debtor.phone_number || 'N/A'}
   Outstanding Debt: ₦${parseFloat(debtor.debt_amount).toLocaleString()}
`,
  )
  .join('\n')}
    `;

    fs.writeFileSync(reportPath, reportContent);
    console.log(`📄 Detailed report generated: ${reportPath}`);

    await connection.close();
    console.log('\n✅ Query completed successfully!');
  } catch (error) {
    console.error('❌ Error generating debtors list:', error);
    process.exit(1);
  }
}

// Run the function
if (require.main === module) {
  generateShashaRoadDebtors();
}

export { generateShashaRoadDebtors };
