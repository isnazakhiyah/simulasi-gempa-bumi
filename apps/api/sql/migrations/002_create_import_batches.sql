CREATE TABLE IF NOT EXISTS import_batches (
  id uuid PRIMARY KEY,
  source_name text NOT NULL,
  source_file text NOT NULL,
  rows_read integer NOT NULL DEFAULT 0,
  rows_inserted integer NOT NULL DEFAULT 0,
  rows_updated integer NOT NULL DEFAULT 0,
  rows_skipped integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz NULL,
  notes text NULL
);
