# Data Import Debug Notes

The import is failing with a 500 error. Based on the implementation, the likely causes are:

1. **Database transaction failure** - One of the entity saves is failing
2. **Missing foreign key** - A related entity doesn't exist
3. **Type mismatch** - Data types don't match entity expectations

## Common Issues to Check in Server Logs:

1. **PhoneCodeId** - We're hardcoding '1' but this ID might not exist
2. **LgaWard creation** - The LgaWard might be failing to create
3. **PropertyType** - entityProfileId is required but might be causing issues
4. **BillingAccount** - The numeric fields might have type issues

## Suggested Fix:

Check the server terminal logs for the actual error. The logs will show:

- Which record is being processed when it fails
- The exact SQL error or TypeScript error
- Which entity creation step is failing

The error is happening inside the transaction, so look for:

- "Error creating auth user" - Auth server errors (now non-blocking)
- EntityManager save errors
- Foreign key constraint violations
- Type conversion errors
