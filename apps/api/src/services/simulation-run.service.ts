import type { SimulationRunDetail, SimulationRunSummary, SimulationRunStatus } from '@simulasi-gempa/shared-types';
import { simulateScenario } from '@simulasi-gempa/sim-core';
import type { PoolClient } from 'pg';
import { pool } from '../db/index.js';

interface RunRow {
  id: string;
  scenario_id: string;
  parameter_id: string;
  status: SimulationRunStatus;
  summary_json: SimulationRunSummary | string | null;
  started_at: string | null;
  finished_at: string | null;
}

interface ScenarioRunSourceRow {
  scenario_id: string;
  mode: 'real_event' | 'custom';
  title: string;
  parameter_id: string;
  epicenter_lat: string | number;
  epicenter_lon: string | number;
  target_lat: string | number;
  target_lon: string | number;
  target_label: string;
  magnitude: string | number;
  depth_km: string | number;
  site_factor: string | number;
  building_profile_code: 'non_reinforced_masonry' | 'simple_reinforced_concrete';
}

function httpError(statusCode: number, message: string) {
  return Object.assign(new Error(message), { statusCode });
}

function parseSummary(summary: RunRow['summary_json']) {
  if (!summary) {
    return null;
  }

  if (typeof summary === 'string') {
    return JSON.parse(summary) as SimulationRunSummary;
  }

  return summary;
}

function mapRunRow(row: RunRow): SimulationRunDetail {
  return {
    id: row.id,
    scenarioId: row.scenario_id,
    parameterId: row.parameter_id,
    status: row.status,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
    summary: parseSummary(row.summary_json),
  };
}

async function getScenarioRunSource(scenarioId: string, client?: PoolClient) {
  const executor = client ?? pool;
  const result = await executor.query<ScenarioRunSourceRow>(
    `
    SELECT
      s.id AS scenario_id,
      s.mode,
      s.title,
      sp.id AS parameter_id,
      sp.epicenter_lat,
      sp.epicenter_lon,
      sp.target_lat,
      sp.target_lon,
      sp.target_label,
      sp.magnitude,
      sp.depth_km,
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
    throw httpError(404, 'Scenario untuk simulasi tidak ditemukan.');
  }

  return result.rows[0];
}

export async function runScenarioSimulation(scenarioId: string) {
  const scenario = await getScenarioRunSource(scenarioId);
  const client = await pool.connect();
  let runId: string | null = null;

  try {
    const insertedRun = await client.query<RunRow>(
      `
      INSERT INTO simulation_runs (
        scenario_id,
        parameter_id,
        status,
        started_at
      )
      VALUES ($1, $2, $3, NOW())
      RETURNING id, scenario_id, parameter_id, status, summary_json, started_at, finished_at
      `,
      [scenario.scenario_id, scenario.parameter_id, 'running'],
    );

    runId = insertedRun.rows[0].id;

    const summary = simulateScenario({
      scenarioId: scenario.scenario_id,
      title: scenario.title,
      mode: scenario.mode,
      epicenter: {
        lat: Number(scenario.epicenter_lat),
        lon: Number(scenario.epicenter_lon),
      },
      target: {
        lat: Number(scenario.target_lat),
        lon: Number(scenario.target_lon),
        label: scenario.target_label,
      },
      magnitude: Number(scenario.magnitude),
      depthKm: Number(scenario.depth_km),
      siteFactor: Number(scenario.site_factor),
      buildingProfileCode: scenario.building_profile_code,
      gridStepKm: 5,
    });

    const updatedRun = await client.query<RunRow>(
      `
      UPDATE simulation_runs
      SET
        status = $2,
        summary_json = $3::jsonb,
        finished_at = NOW()
      WHERE id = $1
      RETURNING id, scenario_id, parameter_id, status, summary_json, started_at, finished_at
      `,
      [runId, 'completed', JSON.stringify(summary)],
    );

    return mapRunRow(updatedRun.rows[0]);
  } catch (error) {
    if (runId) {
      await client.query(
        `
        UPDATE simulation_runs
        SET
          status = 'failed',
          summary_json = $2::jsonb,
          finished_at = NOW()
        WHERE id = $1
        `,
        [
          runId,
          JSON.stringify({
            error: error instanceof Error ? error.message : 'Simulasi gagal diproses.',
          }),
        ],
      );
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function getLatestSimulationRun(scenarioId: string) {
  const result = await pool.query<RunRow>(
    `
    SELECT
      id,
      scenario_id,
      parameter_id,
      status,
      summary_json,
      started_at,
      finished_at
    FROM simulation_runs
    WHERE scenario_id = $1
    ORDER BY started_at DESC NULLS LAST, finished_at DESC NULLS LAST
    LIMIT 1
    `,
    [scenarioId],
  );

  if (result.rowCount === 0) {
    throw httpError(404, 'Belum ada hasil run untuk scenario ini.');
  }

  return mapRunRow(result.rows[0]);
}

export async function getSimulationRunById(runId: string) {
  const result = await pool.query<RunRow>(
    `
    SELECT
      id,
      scenario_id,
      parameter_id,
      status,
      summary_json,
      started_at,
      finished_at
    FROM simulation_runs
    WHERE id = $1
    LIMIT 1
    `,
    [runId],
  );

  if (result.rowCount === 0) {
    throw httpError(404, 'Run simulasi tidak ditemukan.');
  }

  return mapRunRow(result.rows[0]);
}
