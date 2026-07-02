'use client';

import {
  seedOrganizations,
  seedMarkers,
  seedTerritories,
  seedInvestigations,
  seedOperations,
  seedMissions,
  seedActivity,
} from './seed';
import type {
  Organization,
  MapMarker,
  Territory,
  Investigation,
  Operation,
  Mission,
  ActivityEvent,
} from '../types';

const STORAGE_KEY = 'giu_mock_db_v1';

interface MockDB {
  organizations: Organization[];
  markers: MapMarker[];
  territories: Territory[];
  investigations: Investigation[];
  operations: Operation[];
  missions: Mission[];
  activity: ActivityEvent[];
}

function freshSeed(): MockDB {
  return {
    organizations: structuredClone(seedOrganizations),
    markers: structuredClone(seedMarkers),
    territories: structuredClone(seedTerritories),
    investigations: structuredClone(seedInvestigations),
    operations: structuredClone(seedOperations),
    missions: structuredClone(seedMissions),
    activity: structuredClone(seedActivity),
  };
}

function read(): MockDB {
  if (typeof window === 'undefined') return freshSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = freshSeed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as MockDB;
  } catch {
    return freshSeed();
  }
}

function write(db: MockDB) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent('giu-mock-db-changed'));
}

export const mockStore = {
  read,
  write,
  reset() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('giu-mock-db-changed'));
  },
  subscribe(cb: () => void) {
    if (typeof window === 'undefined') return () => {};
    const handler = () => cb();
    window.addEventListener('giu-mock-db-changed', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('giu-mock-db-changed', handler);
      window.removeEventListener('storage', handler);
    };
  },
};
