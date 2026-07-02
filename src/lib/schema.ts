import { z } from 'zod';
import { THREAT_LEVELS, INVESTIGATION_STATUS, OPERATION_STATUS } from './constants';

export const organizationSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  alias: z.string().max(50).optional().nullable(),
  description: z.string().max(2000).optional().default(''),
  threat_level: z.enum(THREAT_LEVELS),
  founded_year: z.number().int().min(1900).max(new Date().getFullYear()).optional().nullable(),
  members_count: z.number().int().min(0).max(100000).optional().default(0),
  status: z.enum(['active', 'dormant', 'dismantled']).optional().default('active'),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().default('#e6c383'),
});

export const markerSchema = z.object({
  organization_id: z.string().optional().nullable(),
  label: z.string().min(1, 'Label wajib').max(80),
  type: z.enum(['hq', 'stash', 'meetup', 'incident', 'asset']),
  x: z.number().min(0).max(1000),
  y: z.number().min(0).max(1000),
  threat_level: z.enum(THREAT_LEVELS),
  notes: z.string().max(1000).optional().nullable(),
});

export const territorySchema = z.object({
  organization_id: z.string(),
  name: z.string().min(1).max(80),
  points: z
    .array(z.object({ x: z.number(), y: z.number() }))
    .min(3, 'Wilayah minimal 3 titik'),
});

export const investigationSchema = z.object({
  title: z.string().min(2).max(120),
  organization_id: z.string().optional().nullable(),
  status: z.enum(INVESTIGATION_STATUS).optional().default('active'),
  priority: z.enum(THREAT_LEVELS).optional().default('medium'),
  lead_analyst: z.string().min(1).max(80),
  summary: z.string().max(2000).optional().default(''),
});

export const operationSchema = z.object({
  codename: z.string().min(2).max(80),
  organization_id: z.string().optional().nullable(),
  status: z.enum(OPERATION_STATUS).optional().default('planning'),
  objective: z.string().min(2).max(500),
  lead_operator: z.string().min(1).max(80),
  participants: z.number().int().min(1).max(500).optional().default(1),
  planned_at: z.string().optional().nullable(),
  summary: z.string().max(2000).optional().default(''),
});

export const missionSchema = z.object({
  organization_id: z.string(),
  title: z.string().min(2).max(120),
  description: z.string().max(2000).optional().default(''),
  status: z.enum(['planning', 'active', 'completed', 'failed']).optional().default('planning'),
  objective: z.string().max(500).optional().default(''),
});

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
export type MarkerInput = z.infer<typeof markerSchema>;
export type TerritoryInput = z.infer<typeof territorySchema>;
export type InvestigationInput = z.infer<typeof investigationSchema>;
export type OperationInput = z.infer<typeof operationSchema>;
export type MissionInput = z.infer<typeof missionSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
