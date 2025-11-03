# SMS Unit Tracking & Notification System - Implementation Summary

## Overview

Complete implementation of SMS unit tracking with configurable notification preferences for multi-tenant waste management system.

## Database Schema Changes

### 1. EntityProfile Table

**Added Column:**

- `smsUnits` (integer, default: 0) - Tracks available SMS units per waste operator

**Purpose:** Each waste operator entity has their own SMS balance that is atomically decremented when SMS notifications are sent.

### 2. EntityProfilePreference Table

**Added Columns:**

- `enableSmsNotifications` (boolean, default: true) - Toggle SMS notifications
- `enableEmailNotifications` (boolean, default: true) - Toggle email notifications
- `autoGenerateBills` (boolean, default: false) - Auto-generate monthly bills

**Purpose:** Entity-level configuration for billing automation and notification channels.

### 3. NotificationQueue Table

**Created Table with:**

- `id` (BIGSERIAL) - Primary key
- `type` (enum: 'billing', 'payment', 'alert') - Notification type
- `status` (enum: 'pending', 'processing', 'sent', 'failed') - Processing status
- `recipientPhone` (varchar) - Phone number with country code (+234...)
- `recipientEmail` (varchar) - Email address
- `recipientName` (varchar) - Recipient full name
- `amount` (numeric) - Transaction amount
- `month`, `year` (integer) - Billing period
- `propertyAddress` (text) - Property address
- `reference` (varchar) - Payment reference
- `retryCount` (integer, default: 0) - Current retry attempt
- `maxRetries` (integer, default: 3) - Maximum retry attempts
- `sentAt`, `failedAt` (timestamp) - Status timestamps
- `errorMessage` (text) - Error details
- `metadata` (jsonb) - Additional data
- `entityProfileId` (bigint) - Links to waste operator entity
- `smsUnitDeducted` (boolean, default: false) - Tracks if SMS unit was deducted
- `createdAt`, `updatedAt` (timestamp) - Audit timestamps

**Indexes:**

- `IDX_notification_queue_status` - Fast status queries
- `IDX_notification_queue_type` - Filter by notification type
- `IDX_notification_queue_created_at` - Sort by creation time
- `IDX_notification_queue_entity_profile` - Entity filtering

**Foreign Key:**

- `entityProfileId` → `entity_profile(id)` (ON DELETE SET NULL)

## Core Services

### 1. NotificationService (`src/shared/notification.service.ts`)

#### Key Methods:

**`queueBillingNotification(data: BillingNotificationData): Promise<NotificationQueue>`**

- Creates notification queue entry for billing
- Requires: recipientPhone, recipientEmail, recipientName, amount, month, year, propertyAddress, entityProfileId
- Returns: Created notification queue record

**`queuePaymentNotification(data: PaymentNotificationData): Promise<NotificationQueue>`**

- Creates notification queue entry for payment confirmations
- Requires: recipientPhone, recipientEmail, recipientName, amount, reference, entityProfileId
- Returns: Created notification queue record

**`processPendingNotifications(): Promise<void>`**

- Cron job: Runs every 5 minutes
- Fetches up to 50 pending notifications
- Processes each notification with retry logic
- Marks as 'sent' or 'failed'

**`processNotification(notification: NotificationQueue): Promise<void>`**

- Core notification processing logic
- **Preference Checking:**

  - Fetches EntityProfile with preferences relation
  - Checks `enableSmsNotifications` and `enableEmailNotifications`
  - Skips disabled channels

- **SMS Unit Validation:**

  - Checks if `entityProfile.smsUnits > 0`
  - Logs warning if units depleted: `"No SMS units available for entity ${entityProfileId}"`
  - Skips SMS if no units

- **Atomic SMS Unit Deduction:**

  ```sql
  UPDATE entity_profile
  SET sms_units = sms_units - 1
  WHERE id = :id AND sms_units > 0
  ```

  - Uses optimistic locking to prevent race conditions
  - Only deducts if units available
  - Sets `smsUnitDeducted = true` on success

- **Parallel Notification Sending:**

  - Builds array of promises for enabled channels
  - Sends SMS and Email concurrently
  - Uses `Promise.all()` for efficiency

- **Error Handling:**

  - Catches and logs individual channel failures
  - Marks as FAILED if no notifications sent (disabled or no units)
  - Marks as SENT if at least one channel succeeded
  - Increments retryCount on failure
  - Respects maxRetries limit

- **Logging:**
  - Logs preference status for debugging
  - Warns when SMS disabled or units depleted
  - Confirms successful sends
  - Detailed error messages

### 2. TermiiService (`src/shared/termii/termii.service.ts`)

**SMS Provider Integration:**

- API: Termii (https://termii.com)
- Configuration: API key from environment
- From: Configurable sender ID

**Methods:**

- `sendSms(to: string, message: string): Promise<any>`

  - Single SMS sending
  - Parameters: phone with country code (+234...), message text
  - Returns: Termii API response

- `sendBulkSms(to: string[], message: string): Promise<any>`
  - Batch SMS sending (max 100 recipients per batch)
  - Automatically chunks large recipient lists
  - Returns: Array of batch responses

**Supported Features:**

- Channels: dnd, generic, whatsapp, voice
- Message types: plain, unicode, encrypted, voice
- Character encoding: Auto-detects unicode

### 3. ResendService (`src/shared/resend/resend.service.ts`)

**Email Provider Integration:**

- API: Resend (https://resend.com)
- Configuration: API key from environment
- From: 'LAWMA <noreply@lawma.ng>'

**Methods:**

- `sendBillingNotification(data: BillingEmailData): Promise<any>`

  - Pre-built HTML template for billing notifications
  - Includes: amount, period, property address, payment instructions
  - Professional LAWMA branding

- `sendPaymentConfirmation(data: PaymentEmailData): Promise<any>`
  - Pre-built HTML template for payment confirmations
  - Includes: amount, reference, transaction details
  - Professional LAWMA branding

### 4. UtilsBillingService (`src/utils-billing/utils-billing.service.ts`)

#### Billing Auto-Generation:

**`generateBillingsForAllEntitySubscribers(): Promise<void>`**

- **Cron Schedule:** `@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)`
- **Execution:** Runs daily at midnight
- **Date Check:** Only executes on 25th of each month
- **Preference Check:** Only generates for entities with `autoGenerateBills = true`
- **Transaction Isolation:** Each entity processed in separate transaction
- **Process:**
  1. Fetches all active entity profiles with preferences
  2. Filters by autoGenerateBills setting
  3. Groups subscriptions by entity
  4. Generates bills in transaction
  5. Queues notifications for generated bills
  6. Logs success/failure per entity

#### Notification Queuing:

**`queueBillingNotifications(generatedBillings, entityProfile): Promise<void>`**

- Loops through generated billings
- Fetches subscriber details from PropertySubscription
- Combines phone code + phone number: `+${phoneCode}${phone}`
- Fetches street name for property address
- Calls `notificationService.queueBillingNotification()` with:
  - Full phone number with country code
  - Email address
  - Subscriber name
  - Amount, month, year
  - Property address
  - **entityProfileId** for SMS unit tracking
- Logs each queued notification
- Catches and logs errors per notification

## Phone Number Formatting

**Source:** `entity_subscriber_profile` table

- `phoneCode` column: Country code (e.g., "234" for Nigeria)
- `phone` column: Local number without prefix

**Formatting Logic:**

```typescript
const fullPhoneNumber =
  subscriber.phoneCode && subscriber.phone
    ? `+${subscriber.phoneCode}${subscriber.phone}`
    : subscriber.phone;
```

**Example:**

- phoneCode: "234"
- phone: "8012345678"
- Result: "+2348012345678"

## Configuration

### Environment Variables Required:

```env
# Termii SMS Configuration
TERMII_API_KEY=your_termii_api_key
TERMII_FROM=LAWMA
TERMII_API_URL=https://api.ng.termii.com/api

# Resend Email Configuration
RESEND_API_KEY=your_resend_api_key
```

### Entity Profile Preferences:

Managed via `entity_profile_preference` table:

```typescript
{
  autoGenerateBills: boolean (default: false)
  enableSmsNotifications: boolean (default: true)
  enableEmailNotifications: boolean (default: true)
}
```

## Cron Jobs

### 1. Billing Generation

- **Schedule:** Daily at midnight (00:00)
- **Condition:** Only on 25th of month
- **Service:** UtilsBillingService
- **Method:** generateBillingsForAllEntitySubscribers()

### 2. Notification Processing

- **Schedule:** Every 5 minutes
- **Service:** NotificationService
- **Method:** processPendingNotifications()
- **Batch Size:** 50 notifications per run
- **Retry Logic:** Max 3 attempts per notification

## Workflow

### Billing Notification Flow:

1. **Monthly Trigger (25th at midnight):**

   - Cron job checks date
   - Fetches entities with `autoGenerateBills = true`

2. **Bill Generation:**

   - Creates bills for all active subscriptions
   - Groups by entity for transaction isolation
   - Generates bill records in database

3. **Notification Queuing:**

   - Fetches subscriber details
   - Combines phone code + phone number
   - Creates notification_queue entries with entityProfileId
   - Status: 'pending'

4. **Background Processing (every 5 minutes):**

   - Fetches 50 pending notifications
   - For each notification:
     - Fetch entity profile with preferences
     - Check enableSmsNotifications and enableEmailNotifications
     - Validate SMS units (entityProfile.smsUnits > 0)
     - Send enabled channels (SMS, Email)
     - Atomically deduct SMS unit if SMS sent
     - Mark as 'sent' or 'failed'

5. **SMS Unit Deduction:**

   - SQL: `UPDATE entity_profile SET sms_units = sms_units - 1 WHERE id = :id AND sms_units > 0`
   - Atomic operation prevents race conditions
   - Only deducts if units available
   - Updates notification_queue.smsUnitDeducted = true

6. **Retry Logic:**
   - Failed notifications increment retryCount
   - Max 3 retries before permanent failure
   - Logs error messages for debugging

### Payment Notification Flow (To Be Implemented):

1. **Payment Webhook:**

   - Receives payment confirmation
   - Validates payment

2. **Customer Notification:**

   - Queues notification to customer
   - Includes: amount, reference, confirmation

3. **Admin Notification:**
   - Fetches admin users from ProfileCollection (isAdmin = true)
   - Queues email to all admin waste operators
   - Includes: customer name, amount, reference, property address

## SMS Unit Management

### Atomic Deduction Logic:

```typescript
const result = await this.dbManager
  .createQueryBuilder()
  .update(EntityProfile)
  .set({ smsUnits: () => 'sms_units - 1' })
  .where('id = :id', { id: entityProfileId })
  .andWhere('sms_units > 0')
  .execute();

if (result.affected > 0) {
  notification.smsUnitDeducted = true;
  // SMS sent successfully
}
```

### Behavior:

- **No units:** SMS skipped, email still sent (if enabled)
- **Preference disabled:** Channel skipped entirely
- **Both disabled:** Notification marked as FAILED
- **Concurrent requests:** Optimistic locking prevents double-deduction

### Monitoring:

- Check `notification_queue.smsUnitDeducted` for audit trail
- Check `entity_profile.smsUnits` for current balance
- Monitor logs for warnings: "No SMS units available for entity"

## Testing Checklist

- [ ] Create entity profile with 0 SMS units
- [ ] Verify SMS skipped, email still sent
- [ ] Add SMS units to entity
- [ ] Verify SMS sent and unit deducted atomically
- [ ] Disable SMS notifications via preference
- [ ] Verify SMS skipped regardless of units
- [ ] Disable email notifications
- [ ] Verify email skipped
- [ ] Disable both SMS and email
- [ ] Verify notification marked as FAILED
- [ ] Generate billing on 25th
- [ ] Verify notifications queued with correct entityProfileId
- [ ] Verify phone numbers formatted with country code
- [ ] Test concurrent notification processing
- [ ] Verify no race conditions in SMS unit deduction
- [ ] Test retry logic for failed notifications
- [ ] Verify max retries limit respected

## Future Enhancements

1. **Payment Webhook Integration:**

   - Hook into payment confirmation endpoint
   - Queue customer notification
   - Fetch and notify admin users

2. **SMS Unit Top-Up:**

   - Admin interface to add units
   - Auto top-up via payment integration
   - Low balance warnings

3. **Notification Templates:**

   - Customizable message templates per entity
   - Template variables ({{name}}, {{amount}}, etc.)
   - Multi-language support

4. **Analytics Dashboard:**

   - SMS usage per entity
   - Notification success/failure rates
   - Cost tracking

5. **Rate Limiting:**
   - Prevent SMS spam
   - Daily/hourly limits per entity
   - Throttling for bulk sends

## Migration Files

1. **1761479900000-CreateNotificationQueueTable.ts**

   - Creates notification_queue table
   - Creates enums for type and status
   - Creates indexes for performance

2. **1761480000000-AddSmsUnitsAndNotificationPreferences.ts**
   - Adds smsUnits to entity_profile
   - Adds enableSmsNotifications and enableEmailNotifications to entity_profile_preference
   - Adds entityProfileId and smsUnitDeducted to notification_queue
   - Creates foreign key and index

## Key Files Modified

- `src/shared/notification.service.ts` - Core notification processing
- `src/shared/termii/termii.service.ts` - SMS integration
- `src/shared/resend/resend.service.ts` - Email integration
- `src/utils-billing/utils-billing.service.ts` - Billing generation and queuing
- `src/utils-billing/entities/entityProfile.entity.ts` - Added smsUnits column
- `src/utils-billing/entities/entityProfilePreference.entity.ts` - Added notification preferences
- `src/shared/notificationQueue.entity.ts` - Added entityProfileId and smsUnitDeducted

## Dependencies

- `@nestjs/schedule` - Cron job scheduling
- `termii-api` - SMS provider SDK
- `resend` - Email provider SDK
- `typeorm` - Database ORM with atomic operations

---

**Implementation Date:** October 2025
**Status:** ✅ Complete - Ready for testing
**Next Steps:** Payment webhook integration, admin notification for payments
