export function normalizeSearchQuery(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

export function matchesSearch(query: string, ...values: Array<string | number | null | undefined>): boolean {
  if (!query) {
    return true
  }

  return values
    .filter((value): value is string | number => value !== null && value !== undefined)
    .some((value) => String(value).toLowerCase().includes(query))
}
