import { z } from 'zod';

const point = z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]);

export const hotspotSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('circle'),
    id: z.string().min(1),
    label: z.string().min(1),
    evidenceId: z.string().optional(),
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    r: z.number().min(0.005).max(0.5),
  }),
  z.object({
    type: z.literal('rect'),
    id: z.string().min(1),
    label: z.string().min(1),
    evidenceId: z.string().optional(),
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().min(0.005).max(1),
    height: z.number().min(0.005).max(1),
  }),
  z.object({
    type: z.literal('polygon'),
    id: z.string().min(1),
    label: z.string().min(1),
    evidenceId: z.string().optional(),
    points: z.array(point).min(3),
  }),
]);

export const sceneSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  artKey: z.string().min(1),
  description: z.string().min(1),
  hotspots: z.array(hotspotSchema).min(1),
});

export const evidenceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.enum([
    'physical_object',
    'photograph',
    'document',
    'testimony',
    'technical_report',
    'material_trace',
    'time_record',
    'written_message',
    'visual_observation',
    'chronological_clue',
  ]),
  sceneId: z.string().min(1),
  description: z.string().min(1),
  detail: z.string().min(1),
  icon: z.string().min(1),
  metadata: z.record(z.string()).optional(),
});

export const suspectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  age: z.number().int().min(16).max(99),
  occupation: z.string().min(1),
  relation: z.string().min(1),
  statement: z.string().min(1),
  timeline: z.array(z.string()),
  relatedEvidenceIds: z.array(z.string()),
});

export const caseSchema = z.object({
  id: z.string().min(1),
  number: z.string().min(1),
  title: z.string().min(1),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  type: z.string().min(1),
  estimatedMinutes: z.number().int().min(1).max(120),
  summary: z.string().min(1),
  briefing: z.string().min(1),
  locationName: z.string().min(1),
  caseDate: z.string().min(1),
  scenes: z.array(sceneSchema).min(1),
  evidence: z.array(evidenceSchema).min(1),
  suspects: z.array(suspectSchema).min(1),
  motives: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).min(2),
  methodSteps: z.array(z.object({ id: z.string().min(1), label: z.string().min(1) })).min(3),
  solution: z.object({
    culpritId: z.string().min(1),
    motiveId: z.string().min(1),
    methodStepIds: z.array(z.string()).min(1),
    decisiveEvidenceIds: z.array(z.string()).min(1),
    explanation: z.string().min(1),
    postResolutionReveal: z.object({
      evidenceName: z.string().min(1),
      text: z.string().min(1),
    }),
  }),
  rewardXp: z.number().int().min(0).max(1000),
});
