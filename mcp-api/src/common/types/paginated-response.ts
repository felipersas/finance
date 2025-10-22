export interface PaginatedResponse<T> {
  pages: number;
  items: number;
  data: T[];
}
