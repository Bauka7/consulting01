// Backend returns LocalDateTime without timezone suffix (e.g. "2026-05-15T19:29:54").
// JavaScript treats such strings as LOCAL time, but they are actually UTC.
// Appending 'Z' forces correct UTC interpretation.
export function parseDate(value: string): Date {
  if (!value) return new Date(NaN)
  const hasZone = value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value)
  return new Date(hasZone ? value : value + 'Z')
}
