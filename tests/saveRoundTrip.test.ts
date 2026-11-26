import { createSaveService } from '@/features/persistence/saveService';
import { createInMemorySaveRepository } from '@/database/repositories/inMemorySaveRepository';
import { requireCase } from '@/features/cases/caseRegistry';
import type { InvestigationSave, PersonalNote } from '@/types/save';
import type { PlayerProfile, ScoreHistoryEntry } from '@/types/player';

const case001 = requireCase('case001');

function freshSave(): InvestigationSave {
  return {
    caseId: case001.id,
    status: 'active',
    currentSceneId: 'scene_gallery',
    visitedScenes: ['scene_gallery'],
    discoveredEvidenceIds: ['ev_display_case'],
    examinedHotspotIds: ['hot_display_case'],
    sceneViews: { scene_gallery: { scale: 1.5, translateX: -120, translateY: 40 } },
    hintsUsed: 1,
    elapsedSeconds: 145,
    startedAt: '2025-01-01T10:00:00.000Z',
    updatedAt: '2025-01-01T10:05:00.000Z',
    nodes: [{ id: 'node_1', kind: 'evidence', refId: 'ev_display_case', label: 'Vitrine', detail: 'Vide', x: 10, y: 20 }],
    connections: [{ id: 'conn_1', fromNodeId: 'node_1', toNodeId: 'node_1', comment: 'test' }],
    boardView: { scale: 1.2, translateX: -30, translateY: 10 },
    suspectHypotheses: { suspect_etienne: 'Il cache quelque chose.' },
    lastResult: null,
  };
}

describe('sauvegarde et restauration (service + dépôt en mémoire)', () => {
  it('restaure exactement une enquête persistée (round-trip complet)', async () => {
    const repo = createInMemorySaveRepository();
    const service = createSaveService(repo);
    const save = freshSave();

    await service.persistSave(save);
    const loaded = await service.loadActiveInvestigation();

    expect(loaded).not.toBeNull();
    const { updatedAt, ...rest } = loaded!;
    const { updatedAt: expectedUpdatedAt, ...expectedRest } = save;
    expect(rest).toEqual(expectedRest);
    expect(new Date(updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(expectedUpdatedAt).getTime());
    expect(loaded?.sceneViews.scene_gallery).toEqual({ scale: 1.5, translateX: -120, translateY: 40 });
    expect(loaded?.suspectHypotheses.suspect_etienne).toBe('Il cache quelque chose.');
    expect(loaded?.nodes).toHaveLength(1);
  });

  it('persistSave met à jour le champ updatedAt', async () => {
    const repo = createInMemorySaveRepository();
    const service = createSaveService(repo);
    const save = freshSave();
    await service.persistSave(save);
    const loaded = await service.loadActiveInvestigation();
    expect(new Date(loaded!.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(save.updatedAt).getTime());
  });

  it('charge une enquête par dossier et la supprime (abandon)', async () => {
    const repo = createInMemorySaveRepository();
    const service = createSaveService(repo);
    await service.persistSave(freshSave());
    expect(await service.loadInvestigation(case001.id)).not.toBeNull();
    await service.abandonSave(case001.id);
    expect(await service.loadInvestigation(case001.id)).toBeNull();
    expect(await service.loadActiveInvestigation()).toBeNull();
  });

  it('sauvegarde et supprime des notes personnelles sans perte', async () => {
    const repo = createInMemorySaveRepository();
    const service = createSaveService(repo);
    const note: PersonalNote = {
      id: 'note_1',
      title: 'Piste G-04',
      body: "L'identifiant G-04 apparaît sur toutes les opérations.",
      createdAt: '2025-01-01T10:00:00.000Z',
      updatedAt: '2025-01-01T10:01:00.000Z',
    };
    await service.persistNote(note);
    await service.persistNote({ ...note, body: 'Texte mis à jour.', updatedAt: '2025-01-01T10:02:00.000Z' });

    let notes = await service.loadNotes();
    expect(notes).toHaveLength(1);
    expect(notes[0].body).toBe('Texte mis à jour.');

    await service.removeNote('note_1');
    notes = await service.loadNotes();
    expect(notes).toHaveLength(0);
  });

  it('sauvegarde le profil et l\u2019historique des scores', async () => {
    const repo = createInMemorySaveRepository();
    const service = createSaveService(repo);
    const profile: PlayerProfile = {
      id: 'player_1',
      pseudo: 'Marlowe',
      xp: 120,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
    };
    await service.persistProfile(profile);
    expect(await service.loadProfile()).toEqual(profile);

    const entry: ScoreHistoryEntry = {
      id: 'score_1',
      caseId: 'case001',
      caseNumber: '001',
      caseTitle: 'Le médaillon disparu',
      kind: 'daily',
      dayKey: '2025-01-01',
      score: 850,
      breakdown: { culprit: 400, motive: 200, method: 150, evidence: 100, noHintBonus: 0, total: 850 },
      elapsedSeconds: 420,
      hintsUsed: 2,
      createdAt: '2025-01-01T12:00:00.000Z',
    };
    await service.recordScore(entry);
    const scores = await service.loadScores();
    expect(scores).toHaveLength(1);
    expect(scores[0].score).toBe(850);
  });
});
