import type { ApiErrorResponse, CatalogEventDetail, CatalogEventFilters, CatalogListResponse } from '@simulasi-gempa/shared-types';

function buildQuery(filters: CatalogEventFilters) {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.minMag !== undefined) params.set('minMag', String(filters.minMag));
  if (filters.maxMag !== undefined) params.set('maxMag', String(filters.maxMag));
  if (filters.minDepth !== undefined) params.set('minDepth', String(filters.minDepth));
  if (filters.maxDepth !== undefined) params.set('maxDepth', String(filters.maxDepth));
  if (filters.yearFrom !== undefined) params.set('yearFrom', String(filters.yearFrom));
  if (filters.yearTo !== undefined) params.set('yearTo', String(filters.yearTo));
  if (filters.page !== undefined) params.set('page', String(filters.page));
  if (filters.limit !== undefined) params.set('limit', String(filters.limit));

  const query = params.toString();
  return query ? `?${query}` : '';
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new Error(errorPayload?.error.message ?? 'Permintaan API gagal diproses.');
  }

  return response.json() as Promise<T>;
}

export async function fetchCatalogEvents(filters: CatalogEventFilters) {
  const response = await fetch(`/api/v1/catalog/events${buildQuery(filters)}`);
  return parseApiResponse<CatalogListResponse>(response);
}

export async function fetchCatalogEventDetail(id: string) {
  const response = await fetch(`/api/v1/catalog/events/${id}`);
  return parseApiResponse<CatalogEventDetail>(response);
}
