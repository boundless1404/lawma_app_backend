export function generateBillingSmsMessage(
  subscriberName: string,
  month: string,
  year: string,
  amount: string,
): string {
  return `Dear ${subscriberName}, your ${month} ${year} bill of ₦${amount} is ready. Please proceed to your nearest Golden Rising Sun outlet to make payment. Thank you!`;
}

export function paymentReceivedSubscriber(
  accountName: string,
  amount: string,
): string {
  return `Dear ${accountName}, your payment of ${amount} has been received successfully. Thank you for your payment.`;
}

export function paymentReceivedOperator(
  accountName: string,
  amount: string,
  accountNumber: string,
): string {
  return `Payment Alert: ${amount} received from ${accountName} (Acct: ${accountNumber}).`;
}

// export function transferSuccessfulOperator(
//   amount: string,
//   reference: string,
// ): string {
//   return `Funds Transfer: ${amount} has been successfully transferred to your bank account. Reference: ${reference}`;
// }

export function transferSuccessfulOperator(
  amount: string,
  reference: string,
  operatorName?: string,
  bankName?: string,
  accountNumber?: string,
  date: Date = new Date(),
  supportUrl: string = 'https://paystack.com/help', // Default Paystack URL
): string {
  const formattedDate = date.toLocaleString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let message = `🏦 Funds Transfer Notification\n\n`;
  message += `Dear ${operatorName || 'Valued Operator'},\n\n`;
  message += `✅ Transfer Successful\n\n`;
  message += `💰 Amount: ${amount}\n`;
  message += `📅 Date: ${formattedDate}\n`;
  message += `🔢 Transaction Ref: ${reference}\n`;

  if (bankName && accountNumber) {
    message += `🏛️ Destination: ${bankName} (${accountNumber})\n\n`;
  }

  message += `The funds have been successfully credited to your bank account.\n\n`;
  message += `Need help?\n`;
  message += `▸ Contact Paystack Support: ${supportUrl}\n`;
  message += `▸ Or visit: https://boundlesedge.com/support\n\n`;
  message += `Thank you for using our services.\n\n`;
  message += `Best regards,\nBoundlessEdge Payment Solutions`;

  return message;
}

export function formatAmount(amount: number): string {
  return (amount / 100).toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
  });
}
