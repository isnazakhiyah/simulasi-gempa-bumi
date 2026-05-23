export type CatalogEventSummary = {
  id: string;
  source: string;
  eventTimeRaw: string | null;
  eventDate: string | null;
  eventTimeLocal: string | null;
  magnitude: number;
  depthKm: number;
  latitude: number;
  longitude: number;
  regionLabel: string;
  hasFocalMechanism: boolean;
};

export type CatalogEventDetail = CatalogEventSummary & {
  remark: string | null;
  strike1: number | null;
  dip1: number | null;
  rake1: number | null;
  strike2: number | null;
  dip2: number | null;
  rake2: number | null;
  createdAt: string;
  updatedAt: string;
};

export type CatalogEventFilters = {
  search?: string;
  minMag?: number;
  maxMag?: number;
  minDepth?: number;
  maxDepth?: number;
  yearFrom?: number;
  yearTo?: number;
  page?: number;
  limit?: number;
};

export type CatalogListResponse = {
  items: CatalogEventSummary[];
  page: number;
  limit: number;
  total: number;
};

export type HealthResponse = {
  ok: boolean;
  service: string;
  timestamp: string;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export * from './scenario.js';
