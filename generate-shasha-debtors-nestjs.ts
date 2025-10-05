import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

async function generateShashaRoadDebtors() {
  try {
    console.log(
      '🔍 Generating debtors list for Shasha Road areas (Street IDs: 64, 65, 66, 67)...',
    );
    console.log('📊 Filtering for debts above ₦2,000\n');

    // Create the Nest app to get database connection
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    // SQL query for specific street IDs
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

    const debtors = await dataSource.query(query);

    if (debtors.length === 0) {
      console.log(
        '❌ No debtors found with debt > ₦2,000 on the specified streets (IDs: 64, 65, 66, 67).',
      );
      await app.close();
      return;
    }

    console.log(`✅ Found ${debtors.length} debtors with debt > ₦2,000\n`);

    // Display results
    console.log('📋 DEBTORS LIST (Street IDs: 64, 65, 66, 67):');
    console.log('='.repeat(60));

    debtors.forEach((debtor: any, index: number) => {
      console.log(`${index + 1}. ${debtor.subscriber_name || 'Unknown'}`);
      console.log(`   Property: ${debtor.property_name || 'N/A'}`);
      console.log(
        `   Street: ${debtor.street_name || 'N/A'} (ID: ${debtor.street_id})`,
      );
      console.log(
        `   Ward: ${debtor.ward_name || 'N/A'}, ${debtor.lga_name || 'N/A'}, ${
          debtor.state_name || 'N/A'
        }`,
      );
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
    const csvFilename = `shasha-road-debtors-streetids-64-65-66-67-${timestamp}.csv`;
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
    console.log('='.repeat(30));
    console.log(`Streets Analyzed: 64, 65, 66, 67`);
    console.log(`Total Properties with Debt > ₦2,000: ${debtors.length}`);
    console.log(`Total Outstanding Debt: ₦${totalDebt.toLocaleString()}`);
    console.log(`Average Debt per Property: ₦${averageDebt.toFixed(2)}`);
    console.log(`Highest Individual Debt: ₦${maxDebt.toLocaleString()}`);
    console.log(`Lowest Individual Debt: ₦${minDebt.toLocaleString()}`);

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

    console.log(`\n📄 Files generated:`);
    console.log(`- CSV: ${csvFilename}`);

    // Group by street for additional insights
    console.log('\n🏘️ BREAKDOWN BY STREET:');
    console.log('='.repeat(30));
    const streetGroups = debtors.reduce((acc: any, debtor: any) => {
      const streetKey = `${debtor.street_name} (ID: ${debtor.street_id})`;
      if (!acc[streetKey]) {
        acc[streetKey] = [];
      }
      acc[streetKey].push(debtor);
      return acc;
    }, {});

    Object.entries(streetGroups).forEach(
      ([streetName, streetDebtors]: [string, any[]]) => {
        const streetTotal = streetDebtors.reduce(
          (sum: number, d: any) => sum + parseFloat(d.debt_amount),
          0,
        );
        console.log(`${streetName}:`);
        console.log(`  - Properties: ${streetDebtors.length}`);
        console.log(`  - Total Debt: ₦${streetTotal.toLocaleString()}`);
        console.log(
          `  - Avg Debt: ₦${(streetTotal / streetDebtors.length).toFixed(2)}`,
        );
      },
    );

    await app.close();
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
