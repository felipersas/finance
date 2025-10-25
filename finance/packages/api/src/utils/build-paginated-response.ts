export function buildPaginatedResponse<T>(
  items: T[],
  count: number,
  page: number,
  perPage: number
) {
  return {
    items,
    count,
    page,
    perPage,
    totalPages: Math.ceil(count / perPage),
  }
}
