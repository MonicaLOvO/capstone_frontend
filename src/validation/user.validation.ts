export type UserValidationErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export type UserFormInput = {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department?: string;
  status: string;
};

export type ValidationErrors<T> = Partial<Record<keyof T, string>>;

export function validateUser(
  data: UserFormInput
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

  return errors;
}