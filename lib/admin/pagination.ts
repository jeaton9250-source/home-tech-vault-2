export type PaginationInput = {
  page?: string | number | null;
  limit?: string | number | null;
};

export type PaginationResult = {
  page: number;
  limit: number;
  from: number;
  to: number;
};

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export function parsePagination(
  input: PaginationInput,
  defaultLimit = DEFAULT_LIMIT
): PaginationResult {
  const parsedPage = Number(input.page ?? 1);
  const parsedLimit = Number(
    input.limit ?? defaultLimit
  );

  const page =
    Number.isFinite(parsedPage) &&
    parsedPage > 0
      ? Math.floor(parsedPage)
      : 1;

  const limit =
    Number.isFinite(parsedLimit) &&
    parsedLimit > 0
      ? Math.min(
          Math.floor(parsedLimit),
          MAX_LIMIT
        )
      : defaultLimit;

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return { page, limit, from, to };
}

export function buildPaginationMeta(
  total: number,
  pagination: PaginationResult
) {
  const totalPages = Math.max(
    1,
    Math.ceil(total / pagination.limit)
  );

  return {
    page: pagination.page,
    limit: pagination.limit,
    total,
    totalPages,
    hasNextPage:
      pagination.page < totalPages,
    hasPreviousPage: pagination.page > 1,
  };
}
