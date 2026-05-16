function digitsOnly(value: string): string {
  return value.replace(/\D+/g, '')
}

// Strips non-digit chars but preserves leading '+', limits to max valid length.
// Valid formats: +7XXXXXXXXXX (12 chars), 7XXXXXXXXXX or 8XXXXXXXXXX (11 chars)
export function sanitizePhoneInput(value: string): string {
  const trimmed = value.trimStart()
  if (trimmed.startsWith('+')) {
    return '+' + digitsOnly(trimmed.slice(1)).slice(0, 11)
  }
  return digitsOnly(trimmed).slice(0, 11)
}

// Normalizes any format to +7XXXXXXXXXX for submission.
// Accepts: 7XXXXXXXXXX, 8XXXXXXXXXX, +7XXXXXXXXXX
export function normalizePhone(value: string): string {
  const digits = digitsOnly(value)
  if (!digits) return ''
  let base: string
  if (digits.startsWith('7') || digits.startsWith('8')) {
    base = '7' + digits.slice(1, 11)
  } else {
    base = ('7' + digits).slice(0, 11)
  }
  return '+' + base
}

export function isNormalizedPhone(value: string): boolean {
  return /^\+7\d{10}$/.test(value)
}
