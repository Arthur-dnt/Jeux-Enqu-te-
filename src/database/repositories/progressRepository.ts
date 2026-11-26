import type { InvestigationSave } from '@/types/save';
import { openDb } from '../db';

interface Row {
  case_id: string;
  status: string;
  current_scene_id: string;
  visited_scenes: string;
  discovered_evidence: string;
  examined_hotspots: string;
  scene_views: string;
  hints_used: number;
  elapsed_seconds: number;
  started_at: string;
  updated_at: string;
  board_view: string;
  suspect_hypotheses: string;
  last_result: string | null;
}

function rowToSave(r: Row): InvestigationSave {
  return {
    caseId: r.case_id,
    status: r.status as InvestigationSave['status'],
    currentSceneId: r.current_scene_id,
    visitedScenes: JSON.parse(r.visited_scenes) as string[],
    discoveredEvidenceIds: JSON.parse(r.discovered_evidence) as string[],
    examinedHotspotIds: JSON.parse(r.examined_hotspots) as string[],
    sceneViews: JSON.parse(r.scene_views) as InvestigationSave['sceneViews'],
    hintsUsed: r.hints_used,
    elapsedSeconds: r.elapsed_seconds,
    startedAt: r.started_at,
    updatedAt: r.updated_at,
    nodes: [],
    connections: [],
    boardView: JSON.parse(r.board_view) as InvestigationSave['boardView'],
    suspectHypotheses: JSON.parse(r.suspect_hypotheses) as InvestigationSave['suspectHypotheses'],
    lastResult: r.last_result ? (JSON.parse(r.last_result) as InvestigationSave['lastResult']) : null,
  };
}

function saveToParams(s: InvestigationSave): (string | number | null)[] {
  return [
    s.caseId,
    s.status,
    s.currentSceneId,
    JSON.stringify(s.visitedScenes),
    JSON.stringify(s.discoveredEvidenceIds),
    JSON.stringify(s.examinedHotspotIds),
    JSON.stringify(s.sceneViews),
    s.hintsUsed,
    s.elapsedSeconds,
    s.startedAt,
    s.updatedAt,
    JSON.stringify(s.boardView),
    JSON.stringify(s.suspectHypotheses),
    s.lastResult ? JSON.stringify(s.lastResult) : null,
  ];
}

export async function loadSave(caseId: string): Promise<InvestigationSave | null> {
  const row = await openDb().getFirstAsync<Row>('SELECT * FROM case_progress WHERE case_id = ?', [caseId]);
  if (!row) return null;
  const save = rowToSave(row);
  const db = openDb();
  const nodes = await db.getAllAsync<{ id: string; kind: string; ref_id: string; label: string; detail: string; x: number; y: number }>(
    'SELECT * FROM deduction_nodes WHERE case_id = ?',
    [caseId]
  );
  save.nodes = nodes.map((n) => ({ id: n.id, kind: n.kind as 'evidence' | 'suspect' | 'note', refId: n.ref_id, label: n.label, detail: n.detail, x: n.x, y: n.y }));
  const conns = await db.getAllAsync<{ id: string; from_node_id: string; to_node_id: string; comment: string }>(
    'SELECT * FROM deduction_connections WHERE case_id = ?',
    [caseId]
  );
  save.connections = conns.map((c) => ({ id: c.id, fromNodeId: c.from_node_id, toNodeId: c.to_node_id, comment: c.comment }));
  return save;
}

export async function getActiveSave(): Promise<InvestigationSave | null> {
  const row = await openDb().getFirstAsync<Row>(
    "SELECT * FROM case_progress WHERE status = 'active' ORDER BY updated_at DESC LIMIT 1"
  );
  return row ? loadSave(row.case_id) : null;
}

export async function upsertSave(s: InvestigationSave): Promise<void> {
  const db = openDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO case_progress (case_id, status, current_scene_id, visited_scenes, discovered_evidence, examined_hotspots, scene_views, hints_used, elapsed_seconds, started_at, updated_at, board_view, suspect_hypotheses, last_result)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
       ON CONFLICT(case_id) DO UPDATE SET
         status = excluded.status, current_scene_id = excluded.current_scene_id,
         visited_scenes = excluded.visited_scenes, discovered_evidence = excluded.discovered_evidence,
         examined_hotspots = excluded.examined_hotspots, scene_views = excluded.scene_views,
         hints_used = excluded.hints_used, elapsed_seconds = excluded.elapsed_seconds,
         updated_at = excluded.updated_at, board_view = excluded.board_view,
         suspect_hypotheses = excluded.suspect_hypotheses, last_result = excluded.last_result`,
      saveToParams(s)
    );
    await db.runAsync('DELETE FROM deduction_nodes WHERE case_id = ?', [s.caseId]);
    for (const n of s.nodes) {
      await db.runAsync(
        'INSERT INTO deduction_nodes (id, case_id, kind, ref_id, label, detail, x, y) VALUES (?,?,?,?,?,?,?,?)',
        [n.id, s.caseId, n.kind, n.refId, n.label, n.detail, n.x, n.y]
      );
    }
    await db.runAsync('DELETE FROM deduction_connections WHERE case_id = ?', [s.caseId]);
    for (const c of s.connections) {
      await db.runAsync(
        'INSERT INTO deduction_connections (id, case_id, from_node_id, to_node_id, comment) VALUES (?,?,?,?,?)',
        [c.id, s.caseId, c.fromNodeId, c.toNodeId, c.comment]
      );
    }
    for (const sceneId of s.visitedScenes) {
      await db.runAsync(
        `INSERT INTO scene_visits (case_id, scene_id, first_visited_at, visit_count) VALUES (?,?,?,1)
         ON CONFLICT(case_id, scene_id) DO NOTHING`,
        [s.caseId, sceneId, s.startedAt]
      );
    }
    for (const evId of s.discoveredEvidenceIds) {
      await db.runAsync(
        `INSERT INTO discovered_evidence (case_id, evidence_id, discovered_at) VALUES (?,?,?)
         ON CONFLICT(case_id, evidence_id) DO NOTHING`,
        [s.caseId, evId, s.updatedAt]
      );
    }
  });
}

export async function deleteSave(caseId: string): Promise<void> {
  const db = openDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM deduction_connections WHERE case_id = ?', [caseId]);
    await db.runAsync('DELETE FROM deduction_nodes WHERE case_id = ?', [caseId]);
    await db.runAsync('DELETE FROM case_progress WHERE case_id = ?', [caseId]);
  });
}
