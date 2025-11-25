import type { CreditCard } from "@interfaces/CreditCard";
import type { GiftCard } from "@interfaces/GiftCard";

export type PaymentErrors = { [key: string]: string };

export default class PaymentFormValidator {

  // ---------- Credit Card ----------
  static validateCreditCard(form: CreditCard): PaymentErrors {
    const errors: PaymentErrors = {};

    // Card number
    if (!form.cardNumber?.trim()) {
      errors.cardNumber = "Card number is required";
    } else if (!/^\d{13,19}$/.test(form.cardNumber.replace(/\s+/g, ""))) {
      errors.cardNumber = "Invalid card number, It should be 13-19 digits";
    }

    // Expiry month
    if (!form.expiryMonth?.trim()) {
      errors.expiryMonth = "Expiry month is required";
    } else if (!/^(0[1-9]|1[0-2])$/.test(form.expiryMonth)) {
      errors.expiryMonth = "Invalid expiry month";
    }

    // Expiry year
    if (!form.expiryYear?.trim()) {
      errors.expiryYear = "Expiry year is required";
    } else if (!/^\d{2}$/.test(form.expiryYear)) {
      errors.expiryYear = "Invalid expiry year";
    }

    // CVC
    if (!form.cvcNumber?.trim()) {
      errors.cvcNumber = "CVC is required";
    } else if (!/^\d{3,4}$/.test(form.cvcNumber)) {
      errors.cvcNumber = "Invalid CVC, It should be 3-4 digits";
    }

    // Cardholder name
    if (!form.cardHolder?.trim()) {
      errors.cardHolder = "Name on card is required";
    }

    return errors;
  }

  // ---------- Gift Card ----------
  static validateGiftCard(form: GiftCard): PaymentErrors {
    const errors: PaymentErrors = {};
    if(!form.giftCardnumber?.trim()){
        errors.giftCardnumber = "Gift card number is required";
    }
    else if (!/^[A-Z0-9]{8,20}$/i.test(form.giftCardnumber)) {
      errors.giftCardnumber = "Invalid gift card number, It must be 8-20 characters";
    }
    if (!form.securityCode?.trim()) {
      errors.securityCode = "Gift card code is required";
    } 
    return errors;
  }

  // ---------- Mobile Pay ----------
  static validateMobilePay(f: { phoneNumber: string }): PaymentErrors {
    const errors: PaymentErrors = {};
    if (!f.phoneNumber?.trim()) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^\+?\d{10,15}$/.test(f.phoneNumber)) {
      errors.phoneNumber = "Invalid phone number, It must be 10-15 digits";
    }
    return errors;
  }
}
