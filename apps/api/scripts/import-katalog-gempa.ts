import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';
import { withTransaction, pool } from '../src/db/index.js';

type RawCatalogRow = {
  tgl?: string;
  ot?: string;
  lat?: string;
  lon?: string;
  depth?: string;
  mag?: string;
  remark?: string;
  strike1?: string;
  dip1?: string;
  rake1?: string;
  strike2?: string;
  dip2?: string;
  rake2?: string;
};

type NormalizedRow = {
  sourceEventKey: string;
  eventTimeRaw: string;
  eventDate: string;
  eventTimeLocal: string;
  latitude: number;
  longitude: number;
  depthKm: number;
  magnitude: number;
  remark: string;
  strike1: number | null;
  dip1: number | null;
  rake1: number | null;
  strike2: number | null;
  dip2: number | null;
  rake2: number | null;
  hasFocalMechanism: boolean;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultCsvPath = path.resolve(__dirname, '../../../data/seed/katalog_gempa.csv');

function parseCliFileArgument() {
  const fileFlagIndex = process.argv.findIndex((arg) => arg === '--file');
  if (fileFlagIndex >= 0 && process.argv[fileFlagIndex + 1]) {
    return path.resolve(process.cwd(), process.argv[fileFlagIndex + 1]);
  }

  return defaultCsvPath;
}

function toOptionalNumber(value: string | undefined) {
  if (!value || value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeDate(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!/^\d{4}\/\d{2}\/\d{2}$/.test(trimmed)) {
    return null;
  }

  return trimmed.replace(/\//g, '-');
}

function normalizeTime(value: string | undefined) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!/^\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

function normalizeRow(row: RawCatalogRow): NormalizedRow | null {
  const eventDate = normalizeDate(row.tgl);
  const eventTime = normalizeTime(row.ot);
  const latitude = Number(row.lat);
  const longitude = Number(row.lon);
  const depthKm = Number(row.depth);
  const magnitude = Number(row.mag);
  const remark = (row.remark ?? '').trim();

  if (!eventDate || !eventTime || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(depthKm) || !Number.isFinite(magnitude)) {
    return null;
  }

  const strike1 = toOptionalNumber(row.strike1);
  const dip1 = toOptionalNumber(row.dip1);
  const rake1 = toOptionalNumber(row.rake1);
  const strike2 = toOptionalNumber(row.strike2);
  const dip2 = toOptionalNumber(row.dip2);
  const rake2 = toOptionalNumber(row.rake2);
  const hasFocalMechanism = [strike1, dip1, rake1, strike2, dip2, rake2].some((value) => value !== null);

  const sourceEventKey = createHash('sha1')
    .update([eventDate, eventTime, latitude.toFixed(4), longitude.toFixed(4), depthKm.toFixed(1), magnitude.toFixed(1), remark].join('|'))
    .digest('hex');

  return {
    sourceEventKey,
    eventTimeRaw: `${row.tgl?.trim() ?? ''} ${row.ot?.trim() ?? ''}`.trim(),
    eventDate,
    eventTimeLocal: `${eventDate} ${eventTime}`,
    latitude,
    longitude,
    depthKm,
    magnitude,
    remark,
    strike1,
    dip1,
    rake1,
    strike2,
    dip2,
    rake2,
    hasFocalMechanism,
  };
}

async function main() {
  const filePath = parseCliFileArgument();
  const csvContent = await readFile(filePath, 'utf8');
  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as RawCatalogRow[];

  console.log(`Membaca file katalog: ${filePath}`);
  console.log(`Total baris mentah: ${rows.length}`);

  const dedupedRows = new Map<string, NormalizedRow>();
  let skipped = 0;

  for (const row of rows) {
    const normalized = normalizeRow(row);
    if (!normalized) {
      skipped += 1;
      continue;
    }

    const existing = dedupedRows.get(normalized.sourceEventKey);

    if (!existing) {
      dedupedRows.set(normalized.sourceEventKey, normalized);
      continue;
    }

    dedupedRows.set(normalized.sourceEventKey, {
      ...existing,
      strike1: existing.strike1 ?? normalized.strike1,
      dip1: existing.dip1 ?? normalized.dip1,
      rake1: existing.rake1 ?? normalized.rake1,
      strike2: existing.strike2 ?? normalized.strike2,
      dip2: existing.dip2 ?? normalized.dip2,
      rake2: existing.rake2 ?? normalized.rake2,
      hasFocalMechanism: existing.hasFocalMechanism || normalized.hasFocalMechanism,
    });
  }

  const normalizedRows = Array.from(dedupedRows.values());
  let inserted = 0;
  let updated = 0;

  const batchId = randomUUID();
  const startedAt = new Date();

  await withTransaction(async (client) => {
    await client.query(
      `
        INSERT INTO import_batches (
          id,
          source_name,
          source_file,
          rows_read,
          rows_inserted,
          rows_updated,
          rows_skipped,
          started_at,
          notes
        ) VALUES ($1, $2, $3, $4, 0, 0, 0, $5, $6)
      `,
      [batchId, 'katalog_gempa_csv', filePath, rows.length, startedAt.toISOString(), 'Import awal katalog gempa Indonesia'],
    );

    const existingKeysResult = await client.query<{ source_event_key: string }>('SELECT source_event_key FROM earthquake_events');
    const existingKeys = new Set(existingKeysResult.rows.map((row) => row.source_event_key));

    for (const normalized of normalizedRows) {
      if (existingKeys.has(normalized.sourceEventKey)) {
        updated += 1;
      } else {
        inserted += 1;
      }

      await client.query(
        `
          INSERT INTO earthquake_events (
            id,
            source,
            source_event_key,
            event_time_raw,
            event_time_local,
            event_date,
            latitude,
            longitude,
            geom,
            depth_km,
            magnitude,
            region_label,
            remark,
            strike1,
            dip1,
            rake1,
            strike2,
            dip2,
            rake2,
            has_focal_mechanism
          ) VALUES (
            $2,
            'seed_csv',
            $1,
            $3,
            $4::timestamp,
            $5::date,
            $6,
            $7,
            ST_SetSRID(ST_MakePoint($7, $6), 4326)::geography,
            $8,
            $9,
            $10,
            $10,
            $11,
            $12,
            $13,
            $14,
            $15,
            $16,
            $17
          )
          ON CONFLICT (source_event_key)
          DO UPDATE SET
            event_time_raw = EXCLUDED.event_time_raw,
            event_time_local = EXCLUDED.event_time_local,
            event_date = EXCLUDED.event_date,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            geom = EXCLUDED.geom,
            depth_km = EXCLUDED.depth_km,
            magnitude = EXCLUDED.magnitude,
            region_label = COALESCE(EXCLUDED.region_label, earthquake_events.region_label),
            remark = COALESCE(EXCLUDED.remark, earthquake_events.remark),
            strike1 = COALESCE(EXCLUDED.strike1, earthquake_events.strike1),
            dip1 = COALESCE(EXCLUDED.dip1, earthquake_events.dip1),
            rake1 = COALESCE(EXCLUDED.rake1, earthquake_events.rake1),
            strike2 = COALESCE(EXCLUDED.strike2, earthquake_events.strike2),
            dip2 = COALESCE(EXCLUDED.dip2, earthquake_events.dip2),
            rake2 = COALESCE(EXCLUDED.rake2, earthquake_events.rake2),
            has_focal_mechanism = earthquake_events.has_focal_mechanism OR EXCLUDED.has_focal_mechanism,
            updated_at = NOW()
        `,
        [
          normalized.sourceEventKey,
          randomUUID(),
          normalized.eventTimeRaw,
          normalized.eventTimeLocal,
          normalized.eventDate,
          normalized.latitude,
          normalized.longitude,
          normalized.depthKm,
          normalized.magnitude,
          normalized.remark,
          normalized.strike1,
          normalized.dip1,
          normalized.rake1,
          normalized.strike2,
          normalized.dip2,
          normalized.rake2,
          normalized.hasFocalMechanism,
        ],
      );
    }

    await client.query(
      `
        UPDATE import_batches
        SET rows_inserted = $2,
            rows_updated = $3,
            rows_skipped = $4,
            finished_at = $5
        WHERE id = $1
      `,
      [batchId, inserted, updated, skipped, new Date().toISOString()],
    );
  });

  console.log(`Total event unik setelah deduplikasi: ${normalizedRows.length}`);
  console.log('Import selesai.');
  console.log(`Inserted: ${inserted}`);
  console.log(`Updated : ${updated}`);
  console.log(`Skipped : ${skipped}`);
}

main().catch(async (error) => {
  console.error('Import katalog gagal:', error);
  await pool.end();
  process.exitCode = 1;
}).finally(async () => {
  await pool.end();
});
