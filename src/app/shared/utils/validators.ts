/**
 * Simple validation functions
 */

export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function isStrongPassword(password: string): boolean {
  if (!password || password.length < 8) return false;
  return /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
}

export function passwordsMatch(password: string, confirm: string): boolean {
  return password === confirm && password.length > 0;
}

export function isValidMobile(mobile: string): boolean {
  if (!mobile) return false;
  // Allows optional + at start, then digits, spaces, or dashes. 
  // User requested strictly 10 digits.
  return /^\d{10}$/.test(mobile.replace(/\s/g, '').replace('+', ''));
}
