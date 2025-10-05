const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function generateHighValueDebtors() {
  // Database configuration from environment
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: String(process.env.DB_PASSWORD),
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('🔍 Connecting to database...');
    await client.connect();
    console.log('✅ Database connected successfully');

    console.log(
      '💰 Generating HIGH-VALUE debtors list for Shasha Road areas (Street IDs: 64, 65, 66, 67)...',
    );
    console.log('🚨 Filtering for debts ≥ ₦20,000 (Priority Collection)\n');

    // SQL query for high-value debtors (≥₦20,000)
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
        CASE 
          WHEN (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) >= 50000 THEN 'CRITICAL'
          WHEN (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) >= 30000 THEN 'HIGH'
          ELSE 'MEDIUM'
        END as priority_level,
        ba."createdAt" as account_created_date,
        ba."updatedAt" as last_updated
      FROM "propertySubscription" ps
      LEFT JOIN "billingAccount" ba ON ps."id" = ba."propertySubscriptionId"
      LEFT JOIN "street" s ON ps."streetId" = s."id"
      LEFT JOIN "ward" w ON s."wardId" = w."id"
      LEFT JOIN "lga" lga ON w."lgaId" = lga."id"
      LEFT JOIN "state" st ON lga."stateId" = st."id"
      WHERE ps."streetId" IN (64, 65, 66, 67)
        AND (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) >= 20000
      ORDER BY debt_amount DESC;
    `;

    console.log('🔄 Executing high-value debtors query...\n');

    const result = await client.query(query);
    const debtors = result.rows;

    if (debtors.length === 0) {
      console.log(
        '❌ No high-value debtors found with debt ≥ ₦20,000 on the specified streets (IDs: 64, 65, 66, 67).',
      );
      await client.end();
      return;
    }

    console.log(
      `🚨 Found ${debtors.length} HIGH-VALUE debtors with debt ≥ ₦20,000\n`,
    );

    // Display results with priority classification
    console.log('🚨 HIGH-VALUE DEBTORS LIST (≥ ₦20,000):');
    console.log('='.repeat(70));

    debtors.forEach((debtor, index) => {
      const priorityEmoji =
        debtor.priority_level === 'CRITICAL'
          ? '🔥'
          : debtor.priority_level === 'HIGH'
          ? '⚠️'
          : '📢';

      console.log(
        `${index + 1}. ${priorityEmoji} ${
          debtor.subscriber_name || 'Unknown'
        } [${debtor.priority_level}]`,
      );
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
        `   🚨 Outstanding Debt: ₦${parseFloat(
          debtor.debt_amount,
        ).toLocaleString()}`,
      );
      console.log(`   Priority: ${debtor.priority_level} PRIORITY`);
      console.log('   ' + '-'.repeat(60));
    });

    // Generate CSV export for high-value debtors
    const timestamp = new Date().toISOString().split('T')[0];
    const csvFilename = `high-value-debtors-20k-plus-streetids-64-65-66-67-${timestamp}.csv`;
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
      'Priority Level',
      'Account Created',
      'Last Updated',
    ];

    const csvContent = [
      csvHeaders.join(','),
      ...debtors.map((debtor) =>
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
          `"${debtor.priority_level}"`,
          `"${debtor.account_created_date || 'N/A'}"`,
          `"${debtor.last_updated || 'N/A'}"`,
        ].join(','),
      ),
    ].join('\n');

    fs.writeFileSync(csvPath, csvContent);
    console.log(`\n💾 High-value debtors CSV generated: ${csvPath}`);

    // Generate summary statistics
    const totalDebt = debtors.reduce(
      (sum, debtor) => sum + parseFloat(debtor.debt_amount),
      0,
    );
    const averageDebt = totalDebt / debtors.length;
    const maxDebt = Math.max(...debtors.map((d) => parseFloat(d.debt_amount)));
    const minDebt = Math.min(...debtors.map((d) => parseFloat(d.debt_amount)));

    console.log('\n📊 HIGH-VALUE DEBTORS SUMMARY:');
    console.log('='.repeat(40));
    console.log(`Streets Analyzed: 64, 65, 66, 67`);
    console.log(`Total High-Value Debtors (≥₦20,000): ${debtors.length}`);
    console.log(
      `Total Outstanding High-Value Debt: ₦${totalDebt.toLocaleString()}`,
    );
    console.log(`Average High-Value Debt: ₦${averageDebt.toFixed(2)}`);
    console.log(`Highest Individual Debt: ₦${maxDebt.toLocaleString()}`);
    console.log(`Lowest High-Value Debt: ₦${minDebt.toLocaleString()}`);

    // Priority breakdown
    const criticalDebtors = debtors.filter(
      (d) => d.priority_level === 'CRITICAL',
    );
    const highDebtors = debtors.filter((d) => d.priority_level === 'HIGH');
    const mediumDebtors = debtors.filter((d) => d.priority_level === 'MEDIUM');

    console.log('\n🎯 PRIORITY BREAKDOWN:');
    console.log('='.repeat(25));
    console.log(`🔥 CRITICAL (≥₦50,000): ${criticalDebtors.length} properties`);
    if (criticalDebtors.length > 0) {
      const criticalTotal = criticalDebtors.reduce(
        (sum, d) => sum + parseFloat(d.debt_amount),
        0,
      );
      console.log(`   Total Critical Debt: ₦${criticalTotal.toLocaleString()}`);
    }

    console.log(`⚠️ HIGH (₦30,000-₦49,999): ${highDebtors.length} properties`);
    if (highDebtors.length > 0) {
      const highTotal = highDebtors.reduce(
        (sum, d) => sum + parseFloat(d.debt_amount),
        0,
      );
      console.log(`   Total High Debt: ₦${highTotal.toLocaleString()}`);
    }

    console.log(
      `📢 MEDIUM (₦20,000-₦29,999): ${mediumDebtors.length} properties`,
    );
    if (mediumDebtors.length > 0) {
      const mediumTotal = mediumDebtors.reduce(
        (sum, d) => sum + parseFloat(d.debt_amount),
        0,
      );
      console.log(`   Total Medium Debt: ₦${mediumTotal.toLocaleString()}`);
    }

    console.log(`\n📄 Files generated:`);
    console.log(`- High-Value Debtors CSV: ${csvFilename}`);

    // Group by street for additional insights
    console.log('\n🏘️ HIGH-VALUE DEBTORS BY STREET:');
    console.log('='.repeat(40));
    const streetGroups = debtors.reduce((acc, debtor) => {
      const streetKey = `${debtor.street_name} (ID: ${debtor.street_id})`;
      if (!acc[streetKey]) {
        acc[streetKey] = [];
      }
      acc[streetKey].push(debtor);
      return acc;
    }, {});

    Object.entries(streetGroups).forEach(([streetName, streetDebtors]) => {
      const streetTotal = streetDebtors.reduce(
        (sum, d) => sum + parseFloat(d.debt_amount),
        0,
      );
      const criticalCount = streetDebtors.filter(
        (d) => d.priority_level === 'CRITICAL',
      ).length;
      const highCount = streetDebtors.filter(
        (d) => d.priority_level === 'HIGH',
      ).length;
      const mediumCount = streetDebtors.filter(
        (d) => d.priority_level === 'MEDIUM',
      ).length;

      console.log(`${streetName}:`);
      console.log(`  - High-Value Properties: ${streetDebtors.length}`);
      console.log(
        `  - Total High-Value Debt: ₦${streetTotal.toLocaleString()}`,
      );
      console.log(
        `  - Avg Debt: ₦${(streetTotal / streetDebtors.length).toFixed(2)}`,
      );
      console.log(
        `  - Priority Mix: ${criticalCount} Critical, ${highCount} High, ${mediumCount} Medium`,
      );
      console.log('');
    });

    console.log('💡 COLLECTION RECOMMENDATIONS:');
    console.log('='.repeat(35));
    console.log('🔥 CRITICAL (≥₦50,000): Immediate legal action required');
    console.log('⚠️ HIGH (₦30,000-₦49,999): Send formal demand notices');
    console.log('📢 MEDIUM (₦20,000-₦29,999): Offer structured payment plans');

    await client.end();
    console.log(
      '\n✅ High-value debtors analysis completed successfully! 🚨💰',
    );
  } catch (error) {
    console.error('❌ Error generating high-value debtors list:', error);
    if (client) {
      await client.end();
    }
    process.exit(1);
  }
}

// Run the function
if (require.main === module) {
  generateHighValueDebtors();
}

module.exports = { generateHighValueDebtors };
