import { pool } from '../db/index.js';
import { computeEpicentralDistanceKm } from './distance.service.js';
import type {
  BuildingProfileCode,
  CreateCustomScenarioInput,
  CreateScenarioFromEventInput,
  UpdateScenarioParametersInput,
} from '../validators/scenario.validator.js';

type ScenarioMode = 'real_event' | 'custom';

interface ScenarioDbRow {
  id: string;
  mode: ScenarioMode;
  base_event_id: string | null;
  title: string;
  created_at: string;
  epicenter_lat: string | number;
  epicenter_lon: string | number;
  target_lat: string | number;
  target_lon: string | number;
  target_label: string;
  magnitude: string | number;
  depth_km: string | number;
  distance_km: string | number;
  site_factor: string | number;
  building_profile_code: string;
}

function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode });
}

function mapScenarioRow(row: ScenarioDbRow) {
  return {
    id: row.id,
    mode: row.mode,
    baseEventId: row.base_event_id,
    title: row.title,
    createdAt: row.created_at,
    parameters: {
      epicenterLat: Number(row.epicenter_lat),
      epicenterLon: Number(row.epicenter_lon),
      targetLat: Number(row.target_lat),
      targetLon: Number(row.target_lon),
      targetLabel: row.target_label,
      magnitude: Number(row.magnitude),
      depthKm: Number(row.depth_km),
      distanceKm: Number(row.distance_km),
      siteFactor: Number(row.site_factor),
      buildingProfileCode: row.building_profile_code as BuildingProfileCode,
    },
  };
}

export async function getScenarioById(scenarioId: string) {
  const result = await pool.query<ScenarioDbRow>(
    `
    SELECT
      s.id,
      s.mode,
      s.base_event_id,
      s.title,
      s.created_at,
      sp.epicenter_lat,
      sp.epicenter_lon,
      sp.target_lat,
      sp.target_lon,
      sp.target_label,
      sp.magnitude,
      sp.depth_km,
      sp.distance_km,
      sp.site_factor,
      sp.building_profile_code
    FROM scenarios s
    INNER JOIN scenario_parameters sp
      ON sp.scenario_id = s.id
    WHERE s.id = $1
    LIMIT 1
    `,
    [scenarioId],
  );

  if (result.rowCount === 0) {
    throw httpError(404, 'Scenario tidak ditemukan');
  }

  return mapScenarioRow(result.rows[0]);
}

export async function createScenarioFromEvent(payload: CreateScenarioFromEventInput) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const eventResult = await client.query(
      `
      SELECT
        id,
        region_label AS place_name,
        latitude,
        longitude,
        magnitude,
        depth_km
      FROM earthquake_events
      WHERE id = $1
      LIMIT 1
      `,
      [payload.eventId],
    );

    if (eventResult.rowCount === 0) {
      throw httpError(404, 'Event earthquake tidak ditemukan');
    }

    const eventRow = eventResult.rows[0] as {
      id: string;
      place_name?: string;
      latitude: string | number;
      longitude: string | number;
      magnitude: string | number;
      depth_km: string | number;
    };

    const epicenterLat = Number(eventRow.latitude);
    const epicenterLon = Number(eventRow.longitude);

    const magnitude = payload.overrides?.magnitude ?? Number(eventRow.magnitude);
    const depthKm = payload.overrides?.depthKm ?? Number(eventRow.depth_km);

    const targetLat = payload.target?.lat ?? epicenterLat;
    const targetLon = payload.target?.lon ?? epicenterLon;
    const targetLabel = payload.target?.label?.trim() || 'Same as epicenter (ubah nanti)';

    const distanceKm = computeEpicentralDistanceKm(epicenterLat, epicenterLon, targetLat, targetLon);

    const buildingProfile = payload.buildingProfile ?? 'simple_reinforced_concrete';
    const siteFactor = payload.siteFactor ?? 1;
    const title = payload.title?.trim() || `Scenario dari ${eventRow.place_name ?? 'event nyata'}`;

    const insertedScenario = await client.query<{ id: string }>(
      `
      INSERT INTO scenarios (mode, base_event_id, title)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      ['real_event', payload.eventId, title],
    );

    const scenarioId = insertedScenario.rows[0].id;

    await client.query(
      `
      INSERT INTO scenario_parameters (
        scenario_id,
        epicenter_lat,
        epicenter_lon,
        target_lat,
        target_lon,
        target_label,
        magnitude,
        depth_km,
        distance_km,
        site_factor,
        building_profile_code
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        scenarioId,
        epicenterLat,
        epicenterLon,
        targetLat,
        targetLon,
        targetLabel,
        magnitude,
        depthKm,
        distanceKm,
        siteFactor,
        buildingProfile,
      ],
    );

    await client.query('COMMIT');
    return await getScenarioById(scenarioId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function createCustomScenario(payload: CreateCustomScenarioInput) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const epicenterLat = payload.epicenter.lat;
    const epicenterLon = payload.epicenter.lon;
    const targetLat = payload.target.lat;
    const targetLon = payload.target.lon;
    const targetLabel = payload.target.label?.trim() || 'Target custom';

    const distanceKm = computeEpicentralDistanceKm(epicenterLat, epicenterLon, targetLat, targetLon);
    const buildingProfile = payload.buildingProfile ?? 'non_reinforced_masonry';
    const siteFactor = payload.siteFactor ?? 1;

    const insertedScenario = await client.query<{ id: string }>(
      `
      INSERT INTO scenarios (mode, base_event_id, title)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      ['custom', null, payload.title],
    );

    const scenarioId = insertedScenario.rows[0].id;

    await client.query(
      `
      INSERT INTO scenario_parameters (
        scenario_id,
        epicenter_lat,
        epicenter_lon,
        target_lat,
        target_lon,
        target_label,
        magnitude,
        depth_km,
        distance_km,
        site_factor,
        building_profile_code
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
      [
        scenarioId,
        epicenterLat,
        epicenterLon,
        targetLat,
        targetLon,
        targetLabel,
        payload.magnitude,
        payload.depthKm,
        distanceKm,
        siteFactor,
        buildingProfile,
      ],
    );

    await client.query('COMMIT');
    return await getScenarioById(scenarioId);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateScenarioParameters(
  scenarioId: string,
  payload: UpdateScenarioParametersInput,
) {
  const currentResult = await pool.query(
    `
    SELECT
      scenario_id,
      epicenter_lat,
      epicenter_lon,
      target_lat,
      target_lon,
      target_label,
      magnitude,
      depth_km,
      distance_km,
      site_factor,
      building_profile_code
    FROM scenario_parameters
    WHERE scenario_id = $1
    LIMIT 1
    `,
    [scenarioId],
  );

  if (currentResult.rowCount === 0) {
    throw httpError(404, 'Scenario parameter tidak ditemukan');
  }

  const current = currentResult.rows[0] as {
    scenario_id: string;
    epicenter_lat: string | number;
    epicenter_lon: string | number;
    target_lat: string | number;
    target_lon: string | number;
    target_label: string;
    magnitude: string | number;
    depth_km: string | number;
    distance_km: string | number;
    site_factor: string | number;
    building_profile_code: string;
  };

  const epicenterLat = payload.epicenter?.lat ?? Number(current.epicenter_lat);
  const epicenterLon = payload.epicenter?.lon ?? Number(current.epicenter_lon);
  const targetLat = payload.target?.lat ?? Number(current.target_lat);
  const targetLon = payload.target?.lon ?? Number(current.target_lon);
  const targetLabel = payload.target?.label ?? current.target_label;
  const magnitude = payload.magnitude ?? Number(current.magnitude);
  const depthKm = payload.depthKm ?? Number(current.depth_km);
  const siteFactor = payload.siteFactor ?? Number(current.site_factor);
  const buildingProfile =
    payload.buildingProfile ?? (current.building_profile_code as BuildingProfileCode);

  const distanceKm = computeEpicentralDistanceKm(epicenterLat, epicenterLon, targetLat, targetLon);

  await pool.query(
    `
    UPDATE scenario_parameters
    SET
      epicenter_lat = $2,
      epicenter_lon = $3,
      target_lat = $4,
      target_lon = $5,
      target_label = $6,
      magnitude = $7,
      depth_km = $8,
      distance_km = $9,
      site_factor = $10,
      building_profile_code = $11
    WHERE scenario_id = $1
    `,
    [
      scenarioId,
      epicenterLat,
      epicenterLon,
      targetLat,
      targetLon,
      targetLabel,
      magnitude,
      depthKm,
      distanceKm,
      siteFactor,
      buildingProfile,
    ],
  );

  return await getScenarioById(scenarioId);
}
