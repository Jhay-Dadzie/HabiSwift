/**
 * Form validation shared by the tenant and landlord auth flows.
 *
 * Every validator returns `string | null` — the error message, or null when the
 * field is fine — so a form reduces to a map of field → validator and the
 * screens stop hand-rolling `!value ? 'X is required' : ''` checks that only
 * ever caught empty strings.
 */

export type Validator = (value: string) => string | null

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Ghanaian mobile prefixes (without the leading 0). */
const GH_PREFIXES = [
  '20', '23', '24', '25', '26', '27', '28', '29',
  '50', '53', '54', '55', '56', '57', '59',
]

export const required =
  (label: string): Validator =>
  (value) =>
    value.trim().length === 0 ? `${label} is required` : null

export const validateFullName: Validator = (value) => {
  const trimmed = value.trim()
  if (!trimmed) return 'Full name is required'
  if (trimmed.length < 3) return 'Enter your full name'
  if (!trimmed.includes(' ')) return 'Enter both your first and last name'
  return null
}

export const validateEmail: Validator = (value) => {
  const trimmed = value.trim()
  if (!trimmed) return 'Email address is required'
  if (!EMAIL_RE.test(trimmed)) return 'Enter a valid email address'
  return null
}

/** Strips spaces, dashes and brackets, and normalises +233 / 233 to a leading 0. */
export function normalisePhone(value: string): string {
  const digits = value.replace(/[^\d+]/g, '')
  if (digits.startsWith('+233')) return `0${digits.slice(4)}`
  if (digits.startsWith('233')) return `0${digits.slice(3)}`
  return digits
}

export const validatePhone: Validator = (value) => {
  const phone = normalisePhone(value)
  if (!phone) return 'Phone number is required'
  if (!/^0\d{9}$/.test(phone)) return 'Enter a 10-digit number, e.g. 024 123 4567'
  if (!GH_PREFIXES.includes(phone.slice(1, 3))) {
    return 'That is not a recognised Ghanaian network'
  }
  return null
}

/** "024 123 4567" — display formatting, not validation. */
export function formatPhone(value: string): string {
  const phone = normalisePhone(value)
  if (phone.length !== 10) return value
  return `${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6)}`
}

export type PasswordStrength = 'weak' | 'fair' | 'strong'

export interface PasswordAssessment {
  strength: PasswordStrength
  /** 0–3, for the strength meter. */
  score: number
  /** What would move it up a level. */
  hint: string
}

export function assessPassword(value: string): PasswordAssessment {
  const checks = [
    value.length >= 8,
    /[A-Za-z]/.test(value) && /\d/.test(value),
    /[^A-Za-z0-9]/.test(value) || value.length >= 12,
  ]
  const score = checks.filter(Boolean).length

  if (!checks[0]) {
    return { strength: 'weak', score, hint: 'Use at least 8 characters' }
  }
  if (!checks[1]) {
    return { strength: 'weak', score, hint: 'Mix in a number' }
  }
  if (!checks[2]) {
    return { strength: 'fair', score, hint: 'Add a symbol to make it strong' }
  }
  return { strength: 'strong', score, hint: 'Strong password' }
}

export const validatePassword: Validator = (value) => {
  if (!value) return 'Password is required'
  if (value.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Include at least one letter and one number'
  }
  return null
}

export const validateConfirmPassword =
  (password: string): Validator =>
  (value) => {
    if (!value) return 'Re-enter your password to confirm'
    if (value !== password) return 'Passwords do not match'
    return null
  }

/** Ghana Card: GHA-123456789-0. Accepts input with or without the dashes. */
export const validateGhanaCard: Validator = (value) => {
  const cleaned = value.toUpperCase().replace(/[\s-]/g, '')
  if (!cleaned) return 'Ghana Card number is required'
  if (!/^GHA\d{10}$/.test(cleaned)) return 'Enter a valid Ghana Card number'
  return null
}

export function formatGhanaCard(value: string): string {
  const cleaned = value.toUpperCase().replace(/[\s-]/g, '')
  if (!cleaned.startsWith('GHA')) return value.toUpperCase()
  const digits = cleaned.slice(3, 13)
  if (digits.length <= 9) return `GHA-${digits}`
  return `GHA-${digits.slice(0, 9)}-${digits.slice(9)}`
}

/** Login accepts either an email or a phone number in one field. */
export const validateEmailOrPhone: Validator = (value) => {
  const trimmed = value.trim()
  if (!trimmed) return 'Enter your email or phone number'
  if (trimmed.includes('@')) return validateEmail(trimmed)
  // Input with no digits at all is a malformed email, not a phone number —
  // routing it to `validatePhone` would report "Phone number is required"
  // for something the user clearly typed.
  if (!/\d/.test(trimmed)) return 'Enter a valid email address or phone number'
  return validatePhone(trimmed)
}

/**
 * Runs a field → validator map and returns the errors found.
 *
 * `isValid` on the result is cheaper for the caller than re-deriving
 * `Object.values(errors).some(Boolean)` at each call site.
 */
export function validateForm<T extends Record<string, string>>(
  values: T,
  validators: Partial<Record<keyof T, Validator>>
): { errors: Partial<Record<keyof T, string>>; isValid: boolean } {
  const errors: Partial<Record<keyof T, string>> = {}

  for (const key of Object.keys(validators) as (keyof T)[]) {
    const validate = validators[key]
    if (!validate) continue
    const error = validate(values[key] ?? '')
    if (error) errors[key] = error
  }

  return { errors, isValid: Object.keys(errors).length === 0 }
}
