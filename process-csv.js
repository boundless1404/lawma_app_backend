const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvFilePath =
  '/home/akonimayowa/projects/lawma_app_backend/property_records_billing_account_2025-07-03.csv';
const csvContent = fs.readFileSync(csvFilePath, 'utf8');

// Split into lines
const lines = csvContent.trim().split('\n');
const header = lines[0];
const dataRows = lines.slice(1);

// Parse CSV rows
const parsedRows = dataRows.map((line) => {
  const row = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  row.push(current); // Add the last field

  return row;
});

// Track seen property codes
const seenPropertyCodes = new Set();

// Process rows to clear balance for duplicate property codes
const processedRows = parsedRows.map((row) => {
  const propertyCode = row[4]; // Property Code is column index 4
  const balance = row[11]; // Balance is column index 11

  if (seenPropertyCodes.has(propertyCode)) {
    // Clear balance for duplicate property code
    row[11] = '';
  } else {
    // Keep balance for first occurrence
    seenPropertyCodes.add(propertyCode);
  }

  return row;
});

// Convert back to CSV format
const formatCSVField = (field) => {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};

const processedCSV = [
  header,
  ...processedRows.map((row) => row.map(formatCSVField).join(',')),
].join('\n');

// Write the processed CSV
const outputPath =
  '/home/akonimayowa/projects/lawma_app_backend/property_records_billing_account_processed_2025-07-03.csv';
fs.writeFileSync(outputPath, processedCSV);

console.log(`Processed CSV saved to: ${outputPath}`);
console.log(`Total rows processed: ${processedRows.length}`);
console.log(`Unique property codes: ${seenPropertyCodes.size}`);
