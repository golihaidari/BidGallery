export function createMockPaymentIntent(): { paymentIntentId: string } {
  // Example: "pay_20250922_123456"
  const id = `pay_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  return { paymentIntentId: id };
}