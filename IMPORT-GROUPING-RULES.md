# CSV Data Import - Subscriber Grouping Rules

## Overview
The import system intelligently groups property records under subscriber profiles to avoid creating duplicate users while respecting data integrity.

## Grouping Logic

### ✅ Real Names ARE Grouped (Same Name + Same Street)
Real customer names appearing multiple times on the same street are grouped under ONE subscriber profile.

**Examples from test-diverse-import.csv:**

1. **MR ADEBAYO OKON** on ADENIYI JONES AVENUE
   - Row 1: House #5 (FLAT, 3 units)
   - Row 6: House #15 (FLAT, 3 units)
   - **Result**: 1 subscriber profile, 2 properties

2. **CHIEF BALOGUN** on ADENIYI JONES AVENUE
   - Row 5: House #13 (FLAT + SHOP)
   - Row 8: House #19 (FLAT)
   - **Result**: 1 subscriber profile, 2 properties

3. **MR ABDULAHI MUSA** on IKEJA WAY
   - Row 13: House #10 (ROOM, 13 units)
   - Row 14: House #12 (FLAT, 2 units)
   - **Result**: 1 subscriber profile, 2 properties

4. **MRS AISHA BELLO** on VICTORIA ISLAND CRESCENT
   - Row 18: House #22 (FLAT, 5 units)
   - Row 21: House #28 (FLAT, 6 units)
   - **Result**: 1 subscriber profile, 2 properties

5. **MR TUNDE BAKARE** on VICTORIA ISLAND CRESCENT
   - Row 22: House #30 (FLAT + SHOP)
   - Row 24: House #34 (FLAT)
   - **Result**: 1 subscriber profile, 2 properties

6. **MRS NGOZI EZE** on SURULERE STREET
   - Row 30: House #15 (FLAT + SHOP)
   - Row 33: House #21 (ROOM + FLAT)
   - **Result**: 1 subscriber profile, 2 properties

7. **MR YUSUF IBRAHIM** on SURULERE STREET
   - Row 32: House #19 (FLAT)
   - Row 36: House #27 (ROOM + SHOP)
   - **Result**: 1 subscriber profile, 2 properties

8. **MR PATRICK OKONKWO** on YABA TECH ROAD
   - Row 38: House #40 (FLAT + SHOP)
   - Row 42: House #48 (FLAT)
   - **Result**: 1 subscriber profile, 2 properties

### ❌ Generic Names NOT Grouped (Each Gets Unique Profile)
Generic placeholder names like "OWNER", "OCCUPANT" are treated as separate entities.

**Examples from test-diverse-import.csv:**

1. **OWNER** appearances (7 total, 7 unique profiles):
   - Row 3: ADENIYI JONES AVENUE #9
   - Row 12: IKEJA WAY #8
   - Row 16: IKEJA WAY #16
   - Row 29: OREGUN INDUSTRIAL ESTATE #7
   - Row 37: SURULERE STREET #29
   - Row 43: YABA TECH ROAD #50
   - **Result**: 7 separate subscriber profiles (not grouped)

2. **OCCUPANT** appearances (7 total, 7 unique profiles):
   - Row 4: ADENIYI JONES AVENUE #11
   - Row 7: ADENIYI JONES AVENUE #17
   - Row 19: VICTORIA ISLAND CRESCENT #24
   - Row 23: VICTORIA ISLAND CRESCENT #32
   - Row 31: SURULERE STREET #17
   - Row 35: SURULERE STREET #25
   - Row 40: YABA TECH ROAD #44
   - **Result**: 7 separate subscriber profiles (not grouped)

## Generic Name Patterns Detected

The system recognizes these as generic placeholders:
- `OCCUPANT`, `OCCUPAN`
- `OWNER`, `OWNER/`
- `TENANT`
- `LANDLORD`
- `CUSTOMER`
- `CLIENT`
- `RESIDENT`
- `UNKNOWN`, `N/A`
- `VACANT`, `EMPTY`

## Email Generation

### For Real Names (Grouped):
Format: `{name}.{street}@lawma.grouped.customer`
- Example: `mr.adebayo.okon.adeniyi.jones.avenue@lawma.grouped.customer`

### For Generic Names (Unique):
Format: `{firstName}.{customerCode}@lawma.imported.customer`
- Example: `owner.tstade003@lawma.imported.customer`

## Summary for test-diverse-import.csv

**Total Records**: 43
**Expected Subscriber Profiles**: 
- Real names (grouped): 8 subscribers managing 16 properties
- Generic names (unique): 14 subscribers (7 OWNER + 7 OCCUPANT)
- Single-property customers: 21 subscribers
- **Total Unique Subscribers**: ~35

**Property Subscriptions**: 43 (one per row)
