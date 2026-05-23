CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode TEXT NOT NULL CHECK (mode IN ('real_event', 'custom')),
  base_event_id UUID NULL REFERENCES earthquake_events(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenarios_mode ON scenarios(mode);
CREATE INDEX IF NOT EXISTS idx_scenarios_base_event_id ON scenarios(base_event_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_created_at ON scenarios(created_at DESC);

CREATE TABLE IF NOT EXISTS scenario_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id UUID NOT NULL UNIQUE REFERENCES scenarios(id) ON DELETE CASCADE,
  epicenter_lat NUMERIC(9,6) NOT NULL,
  epicenter_lon NUMERIC(9,6) NOT NULL,
  target_lat NUMERIC(9,6) NOT NULL,
  target_lon NUMERIC(9,6) NOT NULL,
  target_label TEXT NOT NULL,
  magnitude NUMERIC(4,2) NOT NULL,
  depth_km NUMERIC(6,2) NOT NULL,
  distance_km NUMERIC(10,3) NOT NULL,
  site_factor NUMERIC(4,2) NOT NULL DEFAULT 1.00,
  building_profile_code TEXT NOT NULL CHECK (
    building_profile_code IN (
      'non_reinforced_masonry',
      'simple_reinforced_concrete'
    )
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scenario_parameters_scenario_id
  ON scenario_parameters(scenario_id);