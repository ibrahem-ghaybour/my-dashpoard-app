export function buildQueryPayload(filterOptions: Record<string, any>) {
  const obj = { ...filterOptions }
  const cleaned: Record<string, any> = {}

  Object.entries(obj).forEach(([key, value]) => {
    // نحذف لو: undefined, null, string فاضي, أو "all"
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      cleaned[key] = value
    }
  })

  return cleaned
}