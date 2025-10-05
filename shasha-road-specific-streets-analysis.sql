-- SHASHA ROAD DEBTORS ANALYSIS (SPECIFIC STREET IDs)
-- Street IDs: 64, 65, 66, 67
-- Debt threshold: > ₦2,000
-- Generated: 2025-08-13

\echo '🔍 Analyzing debtors for Shasha Road areas (Street IDs: 64, 65, 66, 67)...'
\echo '📊 Filtering for debts above ₦2,000'
\echo ''

-- Main debtors query
\echo '📋 DEBTORS WITH DEBT > ₦2,000:'
\echo '================================'

SELECT DISTINCT
    ps."id" as property_id,
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
    (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) as outstanding_debt
FROM "propertySubscription" ps
LEFT JOIN "billingAccount" ba ON ps."id" = ba."propertySubscriptionId"
LEFT JOIN "street" s ON ps."streetId" = s."id"
LEFT JOIN "ward" w ON s."wardId" = w."id"
LEFT JOIN "lga" lga ON w."lgaId" = lga."id"
LEFT JOIN "state" st ON lga."stateId" = st."id"
WHERE ps."streetId" IN (64, 65, 66, 67)
    AND (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) > 2000
ORDER BY outstanding_debt DESC;

\echo ''
\echo '📊 SUMMARY STATISTICS:'
\echo '======================'

-- Summary statistics
WITH debtor_stats AS (
    SELECT 
        COUNT(*) as total_debtors,
        SUM(COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) as total_debt,
        AVG(COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) as avg_debt,
        MIN(COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) as min_debt,
        MAX(COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) as max_debt
    FROM "propertySubscription" ps
    LEFT JOIN "billingAccount" ba ON ps."id" = ba."propertySubscriptionId"
    WHERE ps."streetId" IN (64, 65, 66, 67)
        AND (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) > 2000
)
SELECT 
    'Total Properties with Debt > ₦2,000: ' || total_debtors as statistic
FROM debtor_stats
UNION ALL
SELECT 
    'Total Outstanding Debt: ₦' || to_char(total_debt, 'FM999,999,999.00') as statistic
FROM debtor_stats
UNION ALL
SELECT 
    'Average Debt per Property: ₦' || to_char(avg_debt, 'FM999,999,999.00') as statistic
FROM debtor_stats
UNION ALL
SELECT 
    'Highest Individual Debt: ₦' || to_char(max_debt, 'FM999,999,999.00') as statistic
FROM debtor_stats
UNION ALL
SELECT 
    'Lowest Individual Debt: ₦' || to_char(min_debt, 'FM999,999,999.00') as statistic
FROM debtor_stats;

\echo ''
\echo '📈 DEBT DISTRIBUTION:'
\echo '===================='

-- Debt distribution
WITH debt_ranges AS (
    SELECT 
        CASE 
            WHEN (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) BETWEEN 2000 AND 5000 THEN '₦2,000 - ₦5,000'
            WHEN (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) BETWEEN 5001 AND 10000 THEN '₦5,001 - ₦10,000'
            WHEN (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) BETWEEN 10001 AND 20000 THEN '₦10,001 - ₦20,000'
            WHEN (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) > 20000 THEN '> ₦20,000'
        END as debt_range,
        COUNT(*) as property_count
    FROM "propertySubscription" ps
    LEFT JOIN "billingAccount" ba ON ps."id" = ba."propertySubscriptionId"
    WHERE ps."streetId" IN (64, 65, 66, 67)
        AND (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) > 2000
    GROUP BY debt_range
)
SELECT 
    debt_range || ': ' || property_count || ' properties' as distribution
FROM debt_ranges
ORDER BY 
    CASE debt_range
        WHEN '₦2,000 - ₦5,000' THEN 1
        WHEN '₦5,001 - ₦10,000' THEN 2
        WHEN '₦10,001 - ₦20,000' THEN 3
        WHEN '> ₦20,000' THEN 4
    END;

\echo ''
\echo '🏘️ BREAKDOWN BY STREET:'
\echo '======================='

-- Breakdown by street
SELECT 
    s."streetName" || ' (ID: ' || s."id" || ')' as street,
    COUNT(ps."id") as properties_count,
    '₦' || to_char(SUM(COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)), 'FM999,999,999.00') as total_debt,
    '₦' || to_char(AVG(COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)), 'FM999,999,999.00') as avg_debt_per_property
FROM "propertySubscription" ps
LEFT JOIN "billingAccount" ba ON ps."id" = ba."propertySubscriptionId"
LEFT JOIN "street" s ON ps."streetId" = s."id"
WHERE ps."streetId" IN (64, 65, 66, 67)
    AND (COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) > 2000
GROUP BY s."id", s."streetName"
ORDER BY SUM(COALESCE(ba."totalBillings", 0) - COALESCE(ba."totalPayments", 0)) DESC;

\echo ''
\echo '✅ Analysis completed successfully!'
\echo '📄 To export as CSV, copy the main query and run with \copy command'
