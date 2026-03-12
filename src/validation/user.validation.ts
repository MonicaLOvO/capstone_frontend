export type UserValidationErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
};

export type UserFormInput = {
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  role: string;
  department?: string;
  status: string;
};

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export type ValidateUserOptions = {
  /** When true (e.g. edit mode and user already has a real username), username cannot be cleared */
  requireUsername?: boolean;
};

export function validateUser(
  data: UserFormInput,
  options?: ValidateUserOptions
): ValidationErrors<UserFormInput> {
  const errors: ValidationErrors<UserFormInput> = {};

  // FIRST NAME
  if (!data.firstName.trim())
    errors.firstName = "First name is required";
  else if (data.firstName.length < 2 || data.firstName.length > 50)
    errors.firstName = "Must be 2–50 characters";
  else if (!/^[a-zA-Z\s'-]+$/.test(data.firstName))
    errors.firstName = "Only letters allowed";

  // LAST NAME
  if (!data.lastName.trim())
    errors.lastName = "Last name is required";
  else if (data.lastName.length < 2 || data.lastName.length > 50)
    errors.lastName = "Must be 2–50 characters";
  else if (!/^[a-zA-Z\s'-]+$/.test(data.lastName))
    errors.lastName = "Only letters allowed";

  // EMAIL
  if (!data.email.trim())
    errors.email = "Email required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Invalid email";

  // USERNAME (optional unless requireUsername; when provided: 2–50 chars, letters/numbers/space/hyphen/underscore/period)
  const username = typeof data.username === "string" ? data.username.trim() : "";
  if (options?.requireUsername && username.length === 0) {
    errors.username = "Username is required and cannot be cleared once set.";
  } else if (username.length > 0) {
    if (username.length < 2 || username.length > 50)
      errors.username = "Username must be 2–50 characters";
    else if (!/^[a-zA-Z0-9\s._'-]+$/.test(username))
      errors.username = "Only letters, numbers, spaces, and . _ - ' allowed";
  }

  return errors;
}