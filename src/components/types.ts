export interface PaginatedItem {
  id: string
  title: string
  description: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}