'use client';

import { isSupabaseConfigured, supabaseBrowser } from './supabase/client';
import { mockStore } from './mock/store';
import { generateId } from './utils';
import type {
  Organization,
  MapMarker,
  Territory,
  Investigation,
  Operation,
  Mission,
  ActivityEvent,
  Profile,
} from './types';
import { seedUser } from './mock/seed';

type DB = {
  organizations: Organization[];
  markers: MapMarker[];
  territories: Territory[];
  investigations: Investigation[];
  operations: Operation[];
  missions: Mission[];
  activity: ActivityEvent[];
};

type TableName = keyof DB;

function readTable<T extends TableName>(table: T): DB[T] {
  return mockStore.read()[table] as DB[T];
}

function upsertActivity(
  actor: string,
  type: ActivityEvent['type'],
  message: string,
  entityType: ActivityEvent['entity_type'],
  entityId: string | null,
  metadata: Record<string, unknown> = {},
) {
  const db = mockStore.read();
  const event: ActivityEvent = {
    id: generateId('act'),
    type,
    actor,
    message,
    entity_type: entityType,
    entity_id: entityId,
    metadata,
    created_at: new Date().toISOString(),
  };
  db.activity = [event, ...db.activity].slice(0, 200);
  mockStore.write(db);
}

export const data = {
  async listOrganizations(): Promise<Organization[]> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: rows, error } = await sb
        .from('organizations')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return rows as Organization[];
    }
    return [...readTable('organizations')].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  },

  async getOrganization(id: string): Promise<Organization | null> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: row, error } = await sb.from('organizations').select('*').eq('id', id).single();
      if (error) throw error;
      return row as Organization;
    }
    return readTable('organizations').find((o) => o.id === id) ?? null;
  },

  async createOrganization(
    input: Omit<Organization, 'id' | 'created_at' | 'updated_at'>,
    actor = 'Sistem',
  ): Promise<Organization> {
    const now = new Date().toISOString();
    const org: Organization = {
      ...input,
      id: generateId('org'),
      created_at: now,
      updated_at: now,
    };
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: row, error } = await sb.from('organizations').insert(org).select().single();
      if (error) throw error;
      const created = row as Organization;
      await sb.from('activity_events').insert({
        id: generateId('act'),
        type: 'org_created',
        actor,
        message: `Membuat organisasi baru "${created.name}"`,
        entity_type: 'organization',
        entity_id: created.id,
        metadata: {},
        created_at: now,
      });
      return created;
    }
    const db = mockStore.read();
    db.organizations = [org, ...db.organizations];
    mockStore.write(db);
    upsertActivity(actor, 'org_created', `Membuat organisasi baru "${org.name}"`, 'organization', org.id);
    return org;
  },

  async updateOrganization(
    id: string,
    patch: Partial<Organization>,
    actor = 'Sistem',
  ): Promise<Organization> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: row, error } = await sb
        .from('organizations')
        .update({ ...patch, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const updated = row as Organization;
      await sb.from('activity_events').insert({
        id: generateId('act'),
        type: 'org_updated',
        actor,
        message: `Memperbarui profil "${updated.name}"`,
        entity_type: 'organization',
        entity_id: updated.id,
        metadata: patch,
        created_at: now,
      });
      return updated;
    }
    const db = mockStore.read();
    db.organizations = db.organizations.map((o) =>
      o.id === id ? { ...o, ...patch, updated_at: now } : o,
    );
    mockStore.write(db);
    const updated = db.organizations.find((o) => o.id === id)!;
    upsertActivity(actor, 'org_updated', `Memperbarui profil "${updated.name}"`, 'organization', id, patch);
    return updated;
  },

  async deleteOrganization(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { error } = await sb.from('organizations').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const db = mockStore.read();
    db.organizations = db.organizations.filter((o) => o.id !== id);
    db.markers = db.markers.filter((m) => m.organization_id !== id);
    db.territories = db.territories.filter((t) => t.organization_id !== id);
    db.missions = db.missions.filter((m) => m.organization_id !== id);
    mockStore.write(db);
  },

  async listMarkers(): Promise<MapMarker[]> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: rows, error } = await sb.from('markers').select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      return rows as MapMarker[];
    }
    return [...readTable('markers')].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  },

  async createMarker(
    input: Omit<MapMarker, 'id' | 'created_at' | 'updated_at'>,
    actor = 'Sistem',
  ): Promise<MapMarker> {
    const now = new Date().toISOString();
    const marker: MapMarker = { ...input, id: generateId('mk'), created_at: now, updated_at: now };    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: row, error } = await sb.from('markers').insert(marker).select().single();
      if (error) throw error;
      const created = row as MapMarker;
      await sb.from('activity_events').insert({
        id: generateId('act'),
        type: 'marker_added',
        actor,
        message: `Menambah penanda "${created.label}"`,
        entity_type: 'marker',
        entity_id: created.id,
        metadata: { type: created.type, threat: created.threat_level },
        created_at: now,
      });
      return created;
    }
    const db = mockStore.read();
    db.markers = [marker, ...db.markers];
    mockStore.write(db);
    upsertActivity(actor, 'marker_added', `Menambah penanda "${marker.label}"`, 'marker', marker.id, {
      type: marker.type,
      threat: marker.threat_level,
    });
    return marker;
  },

  async updateMarker(id: string, patch: Partial<MapMarker>, actor = 'Sistem'): Promise<MapMarker> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: row, error } = await sb
        .from('markers')
        .update({ ...patch, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return row as MapMarker;
    }
    const db = mockStore.read();
    db.markers = db.markers.map((m) => (m.id === id ? { ...m, ...patch, updated_at: now } : m));
    mockStore.write(db);
    return db.markers.find((m) => m.id === id)!;
  },

  async deleteMarker(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { error } = await sb.from('markers').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const db = mockStore.read();
    db.markers = db.markers.filter((m) => m.id !== id);
    mockStore.write(db);
  },

  async listTerritories(): Promise<Territory[]> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: rows, error } = await sb.from('territories').select('*');
      if (error) throw error;
      return rows as Territory[];
    }
    return [...readTable('territories')];
  },

  async createTerritory(input: Omit<Territory, 'id' | 'created_at'>): Promise<Territory> {
    const territory: Territory = {
      ...input,
      id: generateId('ter'),
      created_at: new Date().toISOString(),
    };
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: row, error } = await sb.from('territories').insert(territory).select().single();
      if (error) throw error;
      return row as Territory;
    }
    const db = mockStore.read();
    db.territories = [...db.territories, territory];
    mockStore.write(db);
    return territory;
  },

  async deleteTerritory(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { error } = await sb.from('territories').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const db = mockStore.read();
    db.territories = db.territories.filter((t) => t.id !== id);
    mockStore.write(db);
  },

  async listInvestigations(): Promise<Investigation[]> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: rows, error } = await sb
        .from('investigations')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return rows as Investigation[];
    }
    return [...readTable('investigations')].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    );
  },

  async createInvestigation(
    input: Omit<Investigation, 'id' | 'case_number' | 'created_at' | 'updated_at' | 'closed_at'>,
    actor = 'Sistem',
  ): Promise<Investigation> {
    const now = new Date().toISOString();
    const year = new Date().getFullYear();
    const db = mockStore.read();
    const seq = String(db.investigations.length + 142).padStart(4, '0');
    const investigation: Investigation = {
      ...input,
      id: generateId('inv'),
      case_number: `GIU-${year}-${seq}`,
      created_at: now,
      updated_at: now,
      closed_at: null,
    };
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: row, error } = await sb.from('investigations').insert(investigation).select().single();
      if (error) throw error;
      const created = row as Investigation;
      await sb.from('activity_events').insert({
        id: generateId('act'),
        type: 'investigation_opened',
        actor,
        message: `Membuka investigasi "${created.title}"`,
        entity_type: 'investigation',
        entity_id: created.id,
        metadata: { case_number: created.case_number },
        created_at: now,
      });
      return created;
    }
    db.investigations = [investigation, ...db.investigations];
    mockStore.write(db);
    upsertActivity(
      actor,
      'investigation_opened',
      `Membuka investigasi "${investigation.title}"`,
      'investigation',
      investigation.id,
      { case_number: investigation.case_number },
    );
    return investigation;
  },

  async updateInvestigation(id: string, patch: Partial<Investigation>, actor = 'Sistem'): Promise<Investigation> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: row, error } = await sb
        .from('investigations')
        .update({ ...patch, updated_at: now })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return row as Investigation;
    }
    const db = mockStore.read();
    db.investigations = db.investigations.map((i) => (i.id === id ? { ...i, ...patch, updated_at: now } : i));
    mockStore.write(db);
    return db.investigations.find((i) => i.id === id)!;
  },

  async listOperations(): Promise<Operation[]> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: rows, error } = await sb.from('operations').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return rows as Operation[];
    }
    return [...readTable('operations')].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  },

  async createOperation(
    input: Omit<Operation, 'id' | 'created_at'>,
    actor = 'Sistem',
  ): Promise<Operation> {
    const now = new Date().toISOString();
    const operation: Operation = { ...input, id: generateId('op'), created_at: now };
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: row, error } = await sb.from('operations').insert(operation).select().single();
      if (error) throw error;
      return row as Operation;
    }
    const db = mockStore.read();
    db.operations = [operation, ...db.operations];
    mockStore.write(db);
    upsertActivity(actor, 'operation_started', `Operasi baru "${operation.codename}" ditambahkan`, 'operation', operation.id);
    return operation;
  },

  async updateOperation(id: string, patch: Partial<Operation>, actor = 'Sistem'): Promise<Operation> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const now = new Date().toISOString();
      const { data: row, error } = await sb
        .from('operations')
        .update({ ...patch, ...(patch.status === 'completed' ? { executed_at: now } : {}) })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return row as Operation;
    }
    const db = mockStore.read();
    db.operations = db.operations.map((o) =>
      o.id === id
        ? {
            ...o,
            ...patch,
            executed_at: patch.status === 'completed' ? new Date().toISOString() : o.executed_at,
          }
        : o,
    );
    mockStore.write(db);
    return db.operations.find((o) => o.id === id)!;
  },

  async listMissions(organizationId?: string): Promise<Mission[]> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      let q = sb.from('missions').select('*').order('created_at', { ascending: false });
      if (organizationId) q = q.eq('organization_id', organizationId);
      const { data: rows, error } = await q;
      if (error) throw error;
      return rows as Mission[];
    }
    const all = [...readTable('missions')];
    return organizationId ? all.filter((m) => m.organization_id === organizationId) : all;
  },

  async createMission(input: Omit<Mission, 'id' | 'created_at'>, actor = 'Sistem'): Promise<Mission> {
    const mission: Mission = { ...input, id: generateId('ms'), created_at: new Date().toISOString() };
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: row, error } = await sb.from('missions').insert(mission).select().single();
      if (error) throw error;
      return row as Mission;
    }
    const db = mockStore.read();
    db.missions = [mission, ...db.missions];
    mockStore.write(db);
    upsertActivity(actor, 'mission_added', `Misi baru "${mission.title}" ditambahkan`, 'mission', mission.id);
    return mission;
  },

  async deleteMission(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { error } = await sb.from('missions').delete().eq('id', id);
      if (error) throw error;
      return;
    }
    const db = mockStore.read();
    db.missions = db.missions.filter((m) => m.id !== id);
    mockStore.write(db);
  },

  async listActivity(limit = 50): Promise<ActivityEvent[]> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: rows, error } = await sb
        .from('activity_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return rows as ActivityEvent[];
    }
    return [...readTable('activity')].slice(0, limit);
  },

  async uploadLogo(file: File, organizationId: string): Promise<string> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `logos/${organizationId}.${ext}`;
      const { error } = await sb.storage.from('organizations').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: pub } = sb.storage.from('organizations').getPublicUrl(path);
      return pub.publicUrl;
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async uploadMarkerIcon(file: File, markerId: string): Promise<string> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const ext = file.name.split('.').pop() ?? 'png';
      const path = `markers/${markerId}.${ext}`;
      const { error } = await sb.storage.from('organizations').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: pub } = sb.storage.from('organizations').getPublicUrl(path);
      return pub.publicUrl;
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async getCurrentUser(): Promise<Profile | null> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const {
        data: { user },
      } = await sb.auth.getUser();
      if (!user) return null;
      return {
        id: user.id,
        email: user.email ?? '',
        full_name: (user.user_metadata['full_name'] as string) ?? user.email ?? 'Operator',
        rank: (user.user_metadata['rank'] as string) ?? 'Analyst',
        avatar_url: (user.user_metadata['avatar_url'] as string) ?? null,
        role: (user.user_metadata['role'] as Profile['role']) ?? 'analyst',
        created_at: user.created_at ?? new Date().toISOString(),
      };
    }
    const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem('giu_session') : null;
    return raw ? (JSON.parse(raw) as Profile) : null;
  },

  async listProfiles(): Promise<Profile[]> {
    if (isSupabaseConfigured) {
      const sb = supabaseBrowser();
      const { data: rows, error } = await sb
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return rows as Profile[];
    }
    const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem('giu_session') : null;
    return raw ? [JSON.parse(raw) as Profile] : [];
  },

  async createProfile(input: {
    email: string;
    password: string;
    full_name: string;
    rank: string;
    role?: Profile['role'];
  }): Promise<void> {
    if (isSupabaseConfigured) {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Gagal membuat anggota');
      }
      return;
    }
    throw new Error('Mode mock tidak mendukung pembuatan anggota baru');
  },

  async deleteProfile(id: string): Promise<void> {
    if (isSupabaseConfigured) {
      const res = await fetch('/api/admin/delete-member', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Gagal menghapus anggota');
      }
      return;
    }
    throw new Error('Mode mock tidak mendukung penghapusan anggota');
  },
};

export async function mockSignIn(email: string, _password: string): Promise<Profile> {
  if (isSupabaseConfigured) {
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithPassword({ email, password: _password });
    if (error) throw error;
    return (await data.getCurrentUser())!;
  }
  const user: Profile = {
    ...seedUser,
    email,
    full_name: email.includes('hermawan') ? seedUser.full_name : 'Lt. S. Pradana',
    rank: email.includes('hermawan') ? 'Captain' : 'Lieutenant',
    role: 'commander',
  };
  window.sessionStorage.setItem('giu_session', JSON.stringify(user));
  window.dispatchEvent(new Event('giu-auth-changed'));
  return user;
}

export async function mockSignOut(): Promise<void> {
  if (isSupabaseConfigured) {
    const sb = supabaseBrowser();
    await sb.auth.signOut();
    return;
  }
  window.sessionStorage.removeItem('giu_session');
  window.dispatchEvent(new Event('giu-auth-changed'));
}
