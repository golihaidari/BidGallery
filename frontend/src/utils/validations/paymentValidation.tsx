export const validateRegisterField = (name: string, value: string, form: any): string => {
  switch(name) {
    case "email":
      if (!value) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email";
      return "";
    case "password":
      if (!value) return "Password is required";
      if (value.length < 6) return "Password must be at least 6 characters";
      return "";
    case "rePassword":
      if (value !== form.password) return "Passwords do not match";
      return "";
    // add other fields as needed
    default: return "";
  }
};

export const validateRegisterForm = (form: any) => {
  const errors: Record<string, string> = {};
  Object.keys(form).forEach(field => {
    const error = validateRegisterField(field, form[field], form);
    if (error) errors[field] = error;
  });
  return errors;
};