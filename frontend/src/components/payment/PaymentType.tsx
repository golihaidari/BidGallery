export const PaymentType = {
    giftCard: 'GiftCard',
    mobilePay: 'MobilePay',
    creditCard: 'CreditCard',
} as const;

export type PaymentType = typeof PaymentType[keyof typeof PaymentType];


