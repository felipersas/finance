export default function paginatedResponse<T>(
  perPage: number | undefined,
  totalItems: number,
  data: T[],
) {
  const totalPages = perPage ? Math.ceil(totalItems / perPage) : 1;
  return {
    pages: totalPages,
    items: totalItems,
    data,
  };
}
