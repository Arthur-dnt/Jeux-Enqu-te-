export interface Migration {
  version: number;
  name: string;
  up: string[];
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    up: [
      `CREATE TABLE IF NOT EXISTS migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS player_profile (
        id TEXT PRIMARY KEY,
        pseudo TEXT NOT NULL,
        xp INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS cases (
        id TEXT PRIMARY KEY,
        number TEXT NOT NULL,
        title TEXT NOT NULL,
        difficulty INTEGER NOT NULL,
        type TEXT NOT NULL,
        estimated_minutes INTEGER NOT NULL,
        summary TEXT NOT NULL,
        location_name TEXT NOT NULL,
        scene_count INTEGER NOT NULL,
        suspect_count INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS case_scenes (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL REFERENCES cases(id),
        name TEXT NOT NULL,
        position INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS evidence (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL REFERENCES cases(id),
        scene_id TEXT NOT NULL REFERENCES case_scenes(id),
        name TEXT NOT NULL,
        category TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS suspects (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL REFERENCES cases(id),
        name TEXT NOT NULL,
        occupation TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS case_progress (
        case_id TEXT PRIMARY KEY REFERENCES cases(id),
        status TEXT NOT NULL,
        current_scene_id TEXT NOT NULL,
        visited_scenes TEXT NOT NULL,
        discovered_evidence TEXT NOT NULL,
        examined_hotspots TEXT NOT NULL,
        scene_views TEXT NOT NULL,
        hints_used INTEGER NOT NULL DEFAULT 0,
        elapsed_seconds INTEGER NOT NULL DEFAULT 0,
        started_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        board_view TEXT NOT NULL,
        suspect_hypotheses TEXT NOT NULL,
        last_result TEXT
      )`,
      `CREATE INDEX IF NOT EXISTS idx_case_progress_updated ON case_progress(updated_at)`,
      `CREATE TABLE IF NOT EXISTS scene_visits (
        case_id TEXT NOT NULL REFERENCES cases(id),
        scene_id TEXT NOT NULL,
        first_visited_at TEXT NOT NULL,
        visit_count INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY (case_id, scene_id)
      )`,
      `CREATE TABLE IF NOT EXISTS discovered_evidence (
        case_id TEXT NOT NULL REFERENCES cases(id),
        evidence_id TEXT NOT NULL,
        discovered_at TEXT NOT NULL,
        PRIMARY KEY (case_id, evidence_id)
      )`,
      `CREATE TABLE IF NOT EXISTS player_notes (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_notes_updated ON player_notes(updated_at)`,
      `CREATE TABLE IF NOT EXISTS deduction_nodes (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL REFERENCES cases(id),
        kind TEXT NOT NULL,
        ref_id TEXT NOT NULL,
        label TEXT NOT NULL,
        detail TEXT NOT NULL DEFAULT '',
        x REAL NOT NULL,
        y REAL NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS deduction_connections (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL REFERENCES cases(id),
        from_node_id TEXT NOT NULL REFERENCES deduction_nodes(id) ON DELETE CASCADE,
        to_node_id TEXT NOT NULL REFERENCES deduction_nodes(id) ON DELETE CASCADE,
        comment TEXT NOT NULL DEFAULT ''
      )`,
      `CREATE INDEX IF NOT EXISTS idx_nodes_case ON deduction_nodes(case_id)`,
      `CREATE INDEX IF NOT EXISTS idx_connections_case ON deduction_connections(case_id)`,
      `CREATE TABLE IF NOT EXISTS score_history (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL,
        case_number TEXT NOT NULL,
        case_title TEXT NOT NULL,
        kind TEXT NOT NULL DEFAULT 'standard',
        day_key TEXT,
        score INTEGER NOT NULL,
        breakdown TEXT NOT NULL,
        elapsed_seconds INTEGER NOT NULL,
        hints_used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS idx_score_created ON score_history(created_at)`,
    ],
  },
];
