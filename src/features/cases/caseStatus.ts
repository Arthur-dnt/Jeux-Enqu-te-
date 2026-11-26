import type { CaseDef, CaseStatus } from '@/types/case';
import { useProfileStore } from '@/store/profileStore';
import { useInvestigationStore } from '@/store/investigationStore';

export function getCaseStatus(caseData: CaseDef): CaseStatus {
  const save = useInvestigationStore.getState().save;
  const active = useInvestigationStore.getState().caseId === caseData.id && save !== null;
  if (active && save.status === 'active') return 'in_progress';
  const perf = useProfileStore.getState().bestPerformanceForCase(caseData.id);
  if (perf.plays > 0) return perf.bestScore > 0 ? 'replayable' : 'solved';
  if (active && save.status === 'solved') return 'solved';
  return 'not_started';
}
