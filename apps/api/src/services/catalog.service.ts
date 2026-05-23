import type { CatalogEventDetail, CatalogEventFilters, CatalogEventSummary } from '@simulasi-gempa/shared-types';
import { pool } from '../db/index.js';
import { config } from '../lib/config.js';

const DEFAULT_LIMIT = config.DEFAULT_CATALOG_LIMIT;
const MAX_LIMIT = config.MAX_CATALOG_LIMIT;

function normalizePagination(filters: CatalogEventFilters) {
  const page = Number.isFinite(filters.page) && filters.page && filters.page > 0 ? filters.page : 1;
  const limit = Math.min(
    MAX_LIMIT,
    Number.isFinite(filters.limit) && filters.limit && filters.limit > 0 ? filters.limit : DEFAULT_LIMIT,
  );

  return {
    page,
    limit,
    offset: (page - 1) * limit,
  };
}

export async function listCatalogEvents(filters: CatalogEventFilters) {
  const conditions: string[] = [];
  const values: Array<string | number> = [];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    const param = `$${values.length}`;
    conditions.push(`(region_label ILIKE ${param} OR remark ILIKE ${param})`);
  }

  if (filters.minMag !== undefined) {
    values.push(filters.minMag);
    conditions.push(`magnitude >= $${values.length}`);
  }

  if (filters.maxMag !== undefined) {
    values.push(filters.maxMag);
    conditions.push(`magnitude <= $${values.length}`);
  }

  if (filters.minDepth !== undefined) {
    values.push(filters.minDepth);
    conditions.push(`depth_km >= $${values.length}`);
  }

  if (filters.maxDepth !== undefined) {
    values.push(filters.maxDepth);
    conditions.push(`depth_km <= $${values.length}`);
  }

  if (filters.yearFrom !== undefined) {
    values.push(filters.yearFrom);
    conditions.push(`EXTRACT(YEAR FROM event_date) >= $${values.length}`);
  }

  if (filters.yearTo !== undefined) {
    values.push(filters.yearTo);
    conditions.push(`EXTRACT(YEAR FROM event_date) <= $${values.length}`);
  }

  const { page, limit, offset } = normalizePagination(filters);
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const totalResult = await pool.query<{ total: string }>(
    `SELECT COUNT(*)::text AS total FROM earthquake_events ${whereClause}`,
    values,
  );

  const rowsResult = await pool.query<CatalogEventSummary>(
    `
      SELECT
        id,
        source,
        event_time_raw AS "eventTimeRaw",
        event_date::text AS "eventDate",
        to_char(event_time_local, 'YYYY-MM-DD"T"HH24:MI:SS.MS') AS "eventTimeLocal",
        magnitude,
        depth_km AS "depthKm",
        latitude,
        longitude,
        COALESCE(region_label, remark, 'Lokasi tidak diketahui') AS "regionLabel",
        has_focal_mechanism AS "hasFocalMechanism"
      FROM earthquake_events
      ${whereClause}
      ORDER BY event_time_local DESC NULLS LAST, magnitude DESC, created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `,
    [...values, limit, offset],
  );

  return {
    items: rowsResult.rows,
    page,
    limit,
    total: Number(totalResult.rows[0]?.total ?? 0),
  };
}

export async function getCatalogEventById(id: string) {
  const result = await pool.query<CatalogEventDetail>(
    `
      SELECT
        id,
        source,
        event_time_raw AS "eventTimeRaw",
        event_date::text AS "eventDate",
        to_char(event_time_local, 'YYYY-MM-DD"T"HH24:MI:SS.MS') AS "eventTimeLocal",
        magnitude,
        depth_km AS "depthKm",
        latitude,
        longitude,
        COALESCE(region_label, remark, 'Lokasi tidak diketahui') AS "regionLabel",
        has_focal_mechanism AS "hasFocalMechanism",
        remark,
        strike1,
        dip1,
        rake1,
        strike2,
        dip2,
        rake2,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM earthquake_events
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return result.rows[0] ?? null;
}
