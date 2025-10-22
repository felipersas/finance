import { PaginatedResponse } from '../types/paginated-response';

export default function paginatedResponse<T>(
  perPage: number | undefined,
  totalItems: number,
  data: T[],
): PaginatedResponse<T> {
  const totalPages = perPage ? Math.ceil(totalItems / perPage) : 1;
  return {
    pages: totalPages,
    items: totalItems,
    data,
  };
}
