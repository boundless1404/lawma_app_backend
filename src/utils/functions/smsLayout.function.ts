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
  message += `💰 Amount: ${amount}\n`;
  message += `📅 Date: ${formattedDate}\n`;
  message += `🔢 Transaction Ref: ${reference}\n`;

  if (bankName && accountNumber) {
    message += `🏛️ Destination: ${bankName} (${accountNumber})\n\n`;
  }

  message += `The transfer has been successfully processed to your designated bank account.\n\n`;
  message += `For any inquiries, please contact support with the reference above.\n\n`;
  message += `Best regards,\n${process.env.APP_NAME || 'Payment Team'}`;

  return message;
}

export function formatAmount(amount: number): string {
  return (amount / 100).toLocaleString('en-NG', {
    style: 'currency',
    currency: 'NGN',
  });
}
