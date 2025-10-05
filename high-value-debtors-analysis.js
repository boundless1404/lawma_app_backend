const fs = require('fs');
const path = require('path');

function analyzeCSVHighValueDebtors() {
  try {
    console.log('🔍 Analyzing CSV file for high-value debtors (₦20,000+)...');
    console.log(
      '📊 Processing property_records_billing_account_2025-07-03.csv\n',
    );

    // Read the CSV file
    const csvPath = path.join(
      __dirname,
      'property_records_billing_account_2025-07-03.csv',
    );
    const csvContent = fs.readFileSync(csvPath, 'utf8');

    // Parse CSV
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',');

    console.log('📋 CSV Headers found:', headers);
    console.log(`📊 Total lines in CSV: ${lines.length}\n`);

    // Process each line
    const highValueDebtors = [];
    const allRecords = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV line (handling quoted fields)
      const fields = parseCSVLine(line);
      if (fields.length < headers.length) continue;

      const record = {};
      headers.forEach((header, index) => {
        record[header.trim()] = fields[index] ? fields[index].trim() : '';
      });

      // Extract balance amount
      const balance = parseFloat(record.Balance || '0');
      record.balanceNum = balance;

      allRecords.push(record);

      // Filter for high-value debtors (₦20,000+)
      if (balance >= 20000) {
        highValueDebtors.push(record);
      }
    }

    console.log(`✅ Total records processed: ${allRecords.length}`);
    console.log(
      `🎯 High-value debtors found (₦20,000+): ${highValueDebtors.length}\n`,
    );

    if (highValueDebtors.length === 0) {
      console.log('❌ No debtors found with balance ≥ ₦20,000');
      return;
    }

    // Sort by balance (highest first)
    highValueDebtors.sort((a, b) => b.balanceNum - a.balanceNum);

    // Display top 20 highest debtors
    console.log('📋 TOP 20 HIGH-VALUE DEBTORS (₦20,000+):');
    console.log('='.repeat(80));

    const topDebtors = highValueDebtors.slice(0, 20);
    topDebtors.forEach((debtor, index) => {
      console.log(`${index + 1}. ${debtor['Customer Name'] || 'Unknown'}`);
      console.log(`   Property Code: ${debtor['Property Code'] || 'N/A'}`);
      console.log(
        `   Address: ${debtor['Street No.']} ${debtor.Street || 'N/A'}`,
      );
      console.log(`   Area: ${debtor.Area || 'N/A'}`);
      console.log(`   Ward: ${debtor.Ward || 'N/A'}`);
      console.log(
        `   Property Type: ${debtor['Property Type'] || 'N/A'} (${
          debtor['Property Unit'] || 'N/A'
        } units)`,
      );
      console.log(
        `   Outstanding Balance: ₦${debtor.balanceNum.toLocaleString()}`,
      );
      console.log('   ' + '-'.repeat(70));
    });

    // Generate CSV export for ALL high-value debtors
    const timestamp = new Date().toISOString().split('T')[0];
    const csvFilename = `high-value-debtors-above-20000-${timestamp}.csv`;
    const csvPathExport = path.join(__dirname, csvFilename);

    const csvHeaders = [
      'Rank',
      'Customer Name',
      'Property Code',
      'Street No',
      'Street',
      'Area',
      'Ward',
      'Local Government Area',
      'Property Type',
      'Property Units',
      'Unit Price',
      'Outstanding Balance',
      'Operator Name',
    ];

    const csvContentExport = [
      csvHeaders.join(','),
      ...highValueDebtors.map((debtor, index) =>
        [
          index + 1,
          `"${debtor['Customer Name'] || 'N/A'}"`,
          `"${debtor['Property Code'] || 'N/A'}"`,
          `"${debtor['Street No.'] || 'N/A'}"`,
          `"${debtor.Street || 'N/A'}"`,
          `"${debtor.Area || 'N/A'}"`,
          `"${debtor.Ward || 'N/A'}"`,
          `"${debtor['Local Government Area'] || 'N/A'}"`,
          `"${debtor['Property Type'] || 'N/A'}"`,
          debtor['Property Unit'] || '0',
          debtor['Unit Price'] || '0',
          debtor.balanceNum.toFixed(2),
          `"${debtor['Operator Name'] || 'N/A'}"`,
        ].join(','),
      ),
    ].join('\n');

    fs.writeFileSync(csvPathExport, csvContentExport);
    console.log(`\n💾 High-value debtors CSV generated: ${csvFilename}`);

    // Generate summary statistics
    const totalDebt = highValueDebtors.reduce(
      (sum, debtor) => sum + debtor.balanceNum,
      0,
    );
    const averageDebt = totalDebt / highValueDebtors.length;
    const maxDebt = Math.max(...highValueDebtors.map((d) => d.balanceNum));
    const minDebt = Math.min(...highValueDebtors.map((d) => d.balanceNum));

    console.log('\n📊 SUMMARY STATISTICS:');
    console.log('='.repeat(50));
    console.log(
      `Total High-Value Debtors (₦20,000+): ${highValueDebtors.length}`,
    );
    console.log(`Total Outstanding Debt: ₦${totalDebt.toLocaleString()}`);
    console.log(`Average Debt: ₦${averageDebt.toFixed(2).toLocaleString()}`);
    console.log(`Highest Individual Debt: ₦${maxDebt.toLocaleString()}`);
    console.log(
      `Lowest Individual Debt (in this category): ₦${minDebt.toLocaleString()}`,
    );

    // Debt distribution for high-value debtors
    console.log('\n📈 HIGH-VALUE DEBT DISTRIBUTION:');
    console.log('='.repeat(50));
    const range1 = highValueDebtors.filter(
      (d) => d.balanceNum >= 20000 && d.balanceNum <= 50000,
    ).length;
    const range2 = highValueDebtors.filter(
      (d) => d.balanceNum > 50000 && d.balanceNum <= 100000,
    ).length;
    const range3 = highValueDebtors.filter(
      (d) => d.balanceNum > 100000 && d.balanceNum <= 200000,
    ).length;
    const range4 = highValueDebtors.filter(
      (d) => d.balanceNum > 200000 && d.balanceNum <= 500000,
    ).length;
    const range5 = highValueDebtors.filter((d) => d.balanceNum > 500000).length;

    console.log(
      `- ₦20,000 - ₦50,000: ${range1} properties (${(
        (range1 / highValueDebtors.length) *
        100
      ).toFixed(1)}%)`,
    );
    console.log(
      `- ₦50,001 - ₦100,000: ${range2} properties (${(
        (range2 / highValueDebtors.length) *
        100
      ).toFixed(1)}%)`,
    );
    console.log(
      `- ₦100,001 - ₦200,000: ${range3} properties (${(
        (range3 / highValueDebtors.length) *
        100
      ).toFixed(1)}%)`,
    );
    console.log(
      `- ₦200,001 - ₦500,000: ${range4} properties (${(
        (range4 / highValueDebtors.length) *
        100
      ).toFixed(1)}%)`,
    );
    console.log(
      `- Above ₦500,000: ${range5} properties (${(
        (range5 / highValueDebtors.length) *
        100
      ).toFixed(1)}%)`,
    );

    // Group by area/ward (top 10)
    console.log('\n🏘️ TOP 10 AREAS BY HIGH-VALUE DEBT:');
    console.log('='.repeat(50));
    const areaGroups = highValueDebtors.reduce((acc, debtor) => {
      const area = debtor.Area || 'Unknown';
      if (!acc[area]) {
        acc[area] = [];
      }
      acc[area].push(debtor);
      return acc;
    }, {});

    Object.entries(areaGroups)
      .sort(
        ([, a], [, b]) =>
          b.reduce((sum, d) => sum + d.balanceNum, 0) -
          a.reduce((sum, d) => sum + d.balanceNum, 0),
      )
      .slice(0, 10)
      .forEach(([area, areaDebtors], index) => {
        const areaTotal = areaDebtors.reduce((sum, d) => sum + d.balanceNum, 0);
        console.log(`${index + 1}. ${area}:`);
        console.log(`   - Properties: ${areaDebtors.length}`);
        console.log(`   - Total Debt: ₦${areaTotal.toLocaleString()}`);
        console.log(
          `   - Avg Debt: ₦${(areaTotal / areaDebtors.length)
            .toFixed(2)
            .toLocaleString()}`,
        );
      });

    // Group by property type
    console.log('\n🏠 BREAKDOWN BY PROPERTY TYPE:');
    console.log('='.repeat(50));
    const propertyGroups = highValueDebtors.reduce((acc, debtor) => {
      const propertyType = debtor['Property Type'] || 'Unknown';
      if (!acc[propertyType]) {
        acc[propertyType] = [];
      }
      acc[propertyType].push(debtor);
      return acc;
    }, {});

    Object.entries(propertyGroups)
      .sort(
        ([, a], [, b]) =>
          b.reduce((sum, d) => sum + d.balanceNum, 0) -
          a.reduce((sum, d) => sum + d.balanceNum, 0),
      )
      .forEach(([propertyType, propertyDebtors]) => {
        const propertyTotal = propertyDebtors.reduce(
          (sum, d) => sum + d.balanceNum,
          0,
        );
        console.log(`${propertyType}:`);
        console.log(
          `  - Properties: ${propertyDebtors.length} (${(
            (propertyDebtors.length / highValueDebtors.length) *
            100
          ).toFixed(1)}%)`,
        );
        console.log(`  - Total Debt: ₦${propertyTotal.toLocaleString()}`);
        console.log(
          `  - Avg Debt: ₦${(propertyTotal / propertyDebtors.length)
            .toFixed(2)
            .toLocaleString()}`,
        );
      });

    console.log(`\n📄 Files generated:`);
    console.log(`- Complete high-value debtors CSV: ${csvFilename}`);
    console.log(`- Source: property_records_billing_account_2025-07-03.csv`);

    console.log('\n✅ High-value debtors analysis completed successfully!');
  } catch (error) {
    console.error('❌ Error analyzing CSV high-value debtors:', error);
    process.exit(1);
  }
}

// Helper function to parse CSV line with proper quote handling
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  fields.push(current);
  return fields;
}

// Run the function
if (require.main === module) {
  analyzeCSVHighValueDebtors();
}

module.exports = { analyzeCSVHighValueDebtors };
