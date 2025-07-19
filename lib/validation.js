// === Required ===
export const Required = (value) => {
  if (value === null || value === undefined || value === "" || (typeof value === "string" && value.trim() === ""))
    return "This field is required.";
  return true;
};

// === Name Validator ===
export const ValidName = (value) => {
  if (!/^[a-zA-Z\s]{3,50}$/.test(value.trim())) {
    return "Name must be at least 3 characters and contain only letters & spaces.";
  }
  return true;
};

// === Email Validator ===
export const ValidEmail = (value) => {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "Please enter a valid email address.";
  }
  return true;
};

// === Password Validator ===
export const StrongPassword = (value) => {
  if (!value || value.length < 8)
    return "Password must be at least 8 characters long.";
  if (!/[A-Z]/.test(value))
    return "Include at least one uppercase letter.";
  if (!/[a-z]/.test(value))
    return "Include at least one lowercase letter.";
  if (!/[0-9]/.test(value))
    return "Include at least one number.";
  if (!/[\W_]/.test(value))
    return "Include at least one special character.";
  return true;
};


export const ValidEmailOrPhone = (value) => {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const isPhone = /^[6-9]\d{9}$/.test(value.trim());
  if (!isEmail && !isPhone) {
    return "Enter a valid email or phone number.";
  }
  return true;
};
