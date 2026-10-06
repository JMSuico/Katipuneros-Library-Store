// [Layer: Libs]
// validators.ts -- Client-side form and input format validators.
// DO NOT put UI components or backend validation logic here.

export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

export function isNonEmptyString(val: string): boolean {
  return val.trim().length > 0;
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '');
  return /^(\+?63|0)?[9]\d{9}$/.test(cleaned);
}
