  export function generateBillingSmsMessage(
    subscriberName: string,
    month: string,
    year: string,
    amount: string,
  ): string {
    return `Dear ${subscriberName}, your ${month} ${year} bill of ₦${amount} is ready. Please proceed to your nearest Golden Rising Sun outlet to make payment. Thank you!`;
  }