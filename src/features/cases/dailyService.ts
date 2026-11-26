import type { CaseDef } from '@/types/case';
import { getAllCases } from './caseRegistry';
import { dayKey, hashString } from '@/utils/time';

export function getDailyCase(date: Date = new Date()): CaseDef {
  const cases = getAllCases();
  const key = dayKey(date);
  const index = hashString('daily_' + key) % cases.length;
  return cases[index];
}
