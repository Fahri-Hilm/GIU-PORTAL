import type { ThreatLevel, InvestigationStatus, OperationStatus } from './constants';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  codename: string | null;
  portrait_url: string | null;
  rank: string;
  avatar_url: string | null;
  role: 'analyst' | 'commander' | 'admin';
  created_at: string;
  status?: 'active' | 'standby' | 'deployed' | 'offline' | null;
  specialization?: string[] | null;
  mission_count?: number | null;
}

export interface Organization {
  id: string;
  name: string;
  alias: string | null;
  description: string;
  threat_level: ThreatLevel;
  logo_url: string | null;
  founded_year: number | null;
  members_count: number;
  status: 'active' | 'dormant' | 'dismantled';
  primary_color: string;
  created_at: string;
  updated_at: string;
}

export interface Territory {
  id: string;
  organization_id: string;
  name: string;
  points: { x: number; y: number }[];
  created_at: string;
}

export interface MapMarker {
  id: string;
  organization_id: string | null;
  label: string;
  type: 'hq' | 'stash' | 'meetup' | 'incident' | 'asset';
  x: number;
  y: number;
  threat_level: ThreatLevel;
  notes: string | null;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Mission {
  id: string;
  organization_id: string;
  title: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'failed';
  objective: string;
  created_at: string;
}

export interface Investigation {
  id: string;
  case_number: string;
  title: string;
  organization_id: string | null;
  status: InvestigationStatus;
  priority: ThreatLevel;
  lead_analyst: string;
  summary: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface InvestigationEvidence {
  id: string;
  investigation_id: string;
  uploaded_by: string | null;
  photo_url: string | null;
  notes: string | null;
  location: string | null;
  evidence_type: 'surveillance' | 'document' | 'testimonial' | 'intel' | 'action';
  created_at: string;
  uploader_name?: string | null;
}

export interface Operation {
  id: string;
  codename: string;
  organization_id: string | null;
  status: OperationStatus;
  objective: string;
  lead_operator: string;
  participants: number;
  planned_at: string | null;
  executed_at: string | null;
  summary: string;
  created_at: string;
}

export interface ActivityEvent {
  id: string;
  type: 'org_created' | 'org_updated' | 'marker_added' | 'investigation_opened' | 'investigation_closed' | 'operation_started' | 'operation_completed' | 'mission_added' | 'login' | 'threat_escalated';
  actor: string;
  message: string;
  entity_type: 'organization' | 'marker' | 'investigation' | 'operation' | 'mission' | 'user';
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type EntityType = ActivityEvent['entity_type'];
export type ActivityType = ActivityEvent['type'];
