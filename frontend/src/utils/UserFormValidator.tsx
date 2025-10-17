type FormErrors = { [key: string]: string };

// Generic type for form values
export type FormValues = Record<string, string>;

export default class FormValidator {

  static validateField(name: string, value: string, form?: FormValues): string {
    switch (name) {
      //---------Always required-------
      case "firstName":
      case "lastName":
      case "address1":
      case "city":
      case "postalCode":
      case "mobileNr":
      case "bio":
      case "style":
        if (!value) return "This field is required";
        return "";

      //---------Email required--------------
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Please enter a valid email";
        return "";
      
      //---------Password required--------------
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        return "";
      case "rePassword":
        if (value !== form?.password) return "Passwords do not match";
        return "";

      //---------Bid amount--------------
      case "bidAmount": {
        if (!value) return "This field is required";
        const num = Number(value);
        if (isNaN(num) || num <= 0) return "Bid must be greater than 0";
        return "";
      }

      default:
        return "";
    }
    
  }

  static validateAllFields(form: FormValues): FormErrors {
    const errors: FormErrors = {};
    for (const key in form) {
      const error = FormValidator.validateField(key, form[key], form);
      if (error) errors[key] = error;
    }
    return errors;
  }
}
