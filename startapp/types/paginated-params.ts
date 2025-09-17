export interface PaginatedParams{
  page: number;
  perPage: number;
  orderDirection?: 'asc' | 'desc';
}