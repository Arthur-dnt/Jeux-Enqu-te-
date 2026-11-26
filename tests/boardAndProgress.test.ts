import { useInvestigationStore } from '@/store/investigationStore';
import { useProfileStore } from '@/store/profileStore';
import { requireCase } from '@/features/cases/caseRegistry';
import type { InvestigationSave } from '@/types/save';
import type { ScoreHistoryEntry } from '@/types/player';

const case001 = requireCase('case001');

function reset() {
  useInvestigationStore.setState({ caseId: null, save: null, activeEvidenceId: null, activeSuspectId: null });
  useProfileStore.setState({ profile: null, scores: [], hydrated: true });
}

describe('tableau de déduction (store d\u2019enquête)', () => {
  beforeEach(() => reset());

  it('ajoute des nœuds de preuve, suspect et note avec des positions', () => {
    useInvestigationStore.getState().startCase(case001);
    const store = useInvestigationStore.getState();
    store.addEvidenceNode('ev_display_case', 'Vitrine', 'Vide');
    store.addSuspectNode('suspect_etienne', 'Étienne Roux', 'Agent de sécurité');
    store.addNoteNode('Hypothèse', 'G-04 revient partout');

    const { nodes } = useInvestigationStore.getState().save!;
    expect(nodes).toHaveLength(3);
    expect(nodes.map((n) => n.kind)).toEqual(['evidence', 'suspect', 'note']);
    for (const n of nodes) {
      expect(n.x).toBeGreaterThanOrEqual(0);
      expect(n.y).toBeGreaterThanOrEqual(0);
    }
  });

  it('déplace un nœud et conserve les autres', () => {
    useInvestigationStore.getState().startCase(case001);
    const store = useInvestigationStore.getState();
    store.addEvidenceNode('ev_display_case', 'Vitrine', 'Vide');
    store.addEvidenceNode('ev_fiber_blue', 'Fibre bleue', 'Sur le support');
    const id = useInvestigationStore.getState().save!.nodes[0].id;
    useInvestigationStore.getState().moveNode(id, 500, 300);
    const nodes = useInvestigationStore.getState().save!.nodes;
    expect(nodes.find((n) => n.id === id)).toMatchObject({ x: 500, y: 300 });
    expect(nodes).toHaveLength(2);
  });

  it('crée une connexion manuelle avec commentaire et interdit les doublons', () => {
    useInvestigationStore.getState().startCase(case001);
    const store = useInvestigationStore.getState();
    store.addEvidenceNode('ev_display_case', 'Vitrine', 'Vide');
    store.addSuspectNode('suspect_etienne', 'Étienne Roux', 'Agent');
    const [a, b] = useInvestigationStore.getState().save!.nodes.map((n) => n.id);

    useInvestigationStore.getState().addConnection(a, b, 'Le gardien a accès à la vitrine');
    expect(useInvestigationStore.getState().save!.connections).toHaveLength(1);

    useInvestigationStore.getState().addConnection(b, a, 'doublon inversé');
    expect(useInvestigationStore.getState().save!.connections).toHaveLength(1);

    useInvestigationStore.getState().addConnection(a, a, 'auto');
    expect(useInvestigationStore.getState().save!.connections).toHaveLength(1);
  });

  it('met à jour et supprime une connexion', () => {
    useInvestigationStore.getState().startCase(case001);
    const store = useInvestigationStore.getState();
    store.addEvidenceNode('ev_display_case', 'Vitrine', 'Vide');
    store.addSuspectNode('suspect_etienne', 'Étienne Roux', 'Agent');
    const [a, b] = useInvestigationStore.getState().save!.nodes.map((n) => n.id);
    useInvestigationStore.getState().addConnection(a, b, 'brouillon');
    const connId = useInvestigationStore.getState().save!.connections[0].id;

    useInvestigationStore.getState().updateConnection(connId, 'Le gardien a accès à la vitrine');
    expect(useInvestigationStore.getState().save!.connections[0].comment).toBe('Le gardien a accès à la vitrine');

    useInvestigationStore.getState().removeConnection(connId);
    expect(useInvestigationStore.getState().save!.connections).toHaveLength(0);
  });

  it('supprime un nœud et ses connexions associées (cascade)', () => {
    useInvestigationStore.getState().startCase(case001);
    const store = useInvestigationStore.getState();
    store.addEvidenceNode('ev_display_case', 'Vitrine', 'Vide');
    store.addSuspectNode('suspect_etienne', 'Étienne Roux', 'Agent');
    store.addSuspectNode('suspect_maya', 'Maya Simon', 'Restauratrice');
    const [a, b] = useInvestigationStore.getState().save!.nodes.map((n) => n.id);
    const c = useInvestigationStore.getState().save!.nodes[2].id;
    useInvestigationStore.getState().addConnection(a, b, 'lien');
    useInvestigationStore.getState().addConnection(b, c, 'autre');

    useInvestigationStore.getState().removeNode(a);
    const { nodes, connections } = useInvestigationStore.getState().save!;
    expect(nodes).toHaveLength(2);
    expect(connections).toHaveLength(1);
    expect(connections.every((conn) => conn.fromNodeId !== a && conn.toNodeId !== a)).toBe(true);
  });

  it('sauvegarde la vue du tableau (zoom/pan) et la vue des scènes', () => {
    useInvestigationStore.getState().startCase(case001);
    useInvestigationStore.getState().setBoardView({ scale: 1.4, translateX: -80, translateY: 25 });
    useInvestigationStore.getState().setSceneView('scene_gallery', { scale: 2, translateX: -200, translateY: 60 });
    const save = useInvestigationStore.getState().save!;
    expect(save.boardView).toEqual({ scale: 1.4, translateX: -80, translateY: 25 });
    expect(save.sceneViews.scene_gallery).toEqual({ scale: 2, translateX: -200, translateY: 60 });
  });

  it('hydrate une sauvegarde restaurée et conserve tout son état', () => {
    const restored: InvestigationSave = {
      ...useInvestigationStore.getState().save!,
      caseId: case001.id,
      currentSceneId: 'scene_locker',
      visitedScenes: ['scene_gallery', 'scene_locker'],
      discoveredEvidenceIds: ['ev_locker_etienne'],
      nodes: [{ id: 'n1', kind: 'note', refId: 'n1', label: 'Note', detail: '', x: 1, y: 2 }],
      connections: [{ id: 'c1', fromNodeId: 'n1', toNodeId: 'n1', comment: '' }],
      boardView: { scale: 1.8, translateX: -40, translateY: -10 },
    };
    useInvestigationStore.getState().hydrate(restored);
    const state = useInvestigationStore.getState();
    expect(state.caseId).toBe(case001.id);
    expect(state.save?.currentSceneId).toBe('scene_locker');
    expect(state.save?.boardView.scale).toBe(1.8);
    expect(state.save?.nodes).toHaveLength(1);
  });
});

describe('progression du joueur (profil)', () => {
  beforeEach(() => reset());

  it('recordScore ajoute une entrée, de l\u2019XP et persiste', () => {
    useProfileStore.getState().ensureProfile();
    const partial: Omit<ScoreHistoryEntry, 'id' | 'createdAt'> = {
      caseId: 'case001',
      caseNumber: '001',
      caseTitle: 'Le médaillon disparu',
      kind: 'standard',
      dayKey: null,
      score: 1000,
      breakdown: { culprit: 400, motive: 200, method: 200, evidence: 150, noHintBonus: 50, total: 1000 },
      elapsedSeconds: 300,
      hintsUsed: 0,
    };
    const created = useProfileStore.getState().recordScore(partial, 105);
    expect(useProfileStore.getState().scores).toHaveLength(1);
    expect(created.id).toBeTruthy();
    expect(useProfileStore.getState().profile?.xp).toBe(105);
  });

  it('bestPerformanceForCase agrège meilleur score, meilleur temps et nombre de parties', () => {
    useProfileStore.getState().ensureProfile();
    const base: Omit<ScoreHistoryEntry, 'id' | 'createdAt'> = {
      caseId: 'case001',
      caseNumber: '001',
      caseTitle: 'Le médaillon disparu',
      kind: 'standard',
      dayKey: null,
      score: 0,
      breakdown: { culprit: 0, motive: 0, method: 0, evidence: 0, noHintBonus: 0, total: 0 },
      elapsedSeconds: 0,
      hintsUsed: 0,
    };
    useProfileStore.getState().recordScore({ ...base, score: 600, elapsedSeconds: 400 }, 10);
    useProfileStore.getState().recordScore({ ...base, score: 800, elapsedSeconds: 500 }, 10);
    useProfileStore.getState().recordScore({ ...base, score: 800, elapsedSeconds: 450 }, 10);

    const perf = useProfileStore.getState().bestPerformanceForCase('case001');
    expect(perf.bestScore).toBe(800);
    expect(perf.bestTimeSeconds).toBe(450);
    expect(perf.plays).toBe(3);
  });
});
