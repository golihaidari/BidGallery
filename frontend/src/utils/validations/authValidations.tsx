// src/utils/validation/authValidation.ts

export interface RegisterForm {
  firstName?: string;
  lastName?: string;
  email: string;
  mobileNr?: string;
  password: string;
  rePassword: string;
  accountType: "customer" | "artist";
  country?: string;
  postalCode?: string;
  city?: string;
  street?: string;
  address?: string;
  bio?: string;
  style?: string;
}

export interface LoginForm {
  email: string;
  password: string;
}

// Email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------- Register Validation ----------------
export const validateRegister = (form: RegisterForm): string[] => {
  const errors: string[] = [];

  if (!form.email || !emailRegex.test(form.email)) {
    errors.push("Invalid email address");
  }

  if (!form.password) {
    errors.push("Password is required");
  }

  if (form.password !== form.rePassword) {
    errors.push("Passwords do not match");
  }

  if (form.accountType === "artist") {
    if (!form.firstName || !form.lastName || !form.bio || !form.style) {
      errors.push("Please fill all artist details");
    }
  }

  if (form.accountType === "customer") {
    if (!form.firstName || !form.lastName || !form.mobileNr) {
      errors.push("Please fill personal details");
    }
    if (!form.postalCode || !form.city || !form.street || !form.country) {
      errors.push("Please fill address details");
    }
  }

  return errors;
};
export default validateRegister;

// ---------------- Login Validation ----------------
export const validateLogin = (form: LoginForm): string[] => {
  const errors: string[] = [];

  if (!form.email || !emailRegex.test(form.email)) {
    errors.push("Invalid email address");
  }

  if (!form.password) {
    errors.push("Password is required");
  }

  return errors;
};
