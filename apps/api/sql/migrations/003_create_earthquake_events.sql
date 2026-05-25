CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS earthquake_events (
  id uuid PRIMARY KEY,
  source text NOT NULL,
  source_event_key text NOT NULL UNIQUE,
  event_time_raw text NULL,
  event_time_utc timestamptz NULL,
  event_time_local timestamp NULL,
  event_date date NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  geom geography(Point, 4326) NULL,
  depth_km double precision NOT NULL,
  magnitude double precision NOT NULL,
  region_label text NULL,
  remark text NULL,
  strike1 double precision NULL,
  dip1 double precision NULL,
  rake1 double precision NULL,
  strike2 double precision NULL,
  dip2 double precision NULL,
  rake2 double precision NULL,
  has_focal_mechanism boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS earthquake_events_event_date_idx ON earthquake_events (event_date DESC);
CREATE INDEX IF NOT EXISTS earthquake_events_magnitude_idx ON earthquake_events (magnitude DESC);
CREATE INDEX IF NOT EXISTS earthquake_events_depth_idx ON earthquake_events (depth_km ASC);
CREATE INDEX IF NOT EXISTS earthquake_events_geom_gist_idx ON earthquake_events USING GIST (geom);
