CREATE TABLE IF NOT EXISTS simulation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  parameter_id UUID NOT NULL REFERENCES scenario_parameters(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  summary_json JSONB,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_simulation_runs_scenario_id_started_at
  ON simulation_runs(scenario_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_simulation_runs_parameter_id
  ON simulation_runs(parameter_id);
