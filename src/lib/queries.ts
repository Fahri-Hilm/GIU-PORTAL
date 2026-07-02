'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { data } from './data';
import { mockStore } from './mock/store';
import { useEffect } from 'react';
import type { Organization, MapMarker, Investigation, Operation, Mission } from './types';

export const queryKeys = {
  organizations: ['organizations'] as const,
  organization: (id: string) => ['organizations', id] as const,
  markers: ['markers'] as const,
  territories: ['territories'] as const,
  investigations: ['investigations'] as const,
  operations: ['operations'] as const,
  missions: (orgId?: string) => ['missions', orgId ?? 'all'] as const,
  activity: (limit?: number) => ['activity', limit ?? 50] as const,
  session: ['session'] as const,
};

export function useMockSubscription() {
  const qc = useQueryClient();
  useEffect(() => mockStore.subscribe(() => qc.invalidateQueries()), [qc]);
}

export function useOrganizations() {
  return useQuery({ queryKey: queryKeys.organizations, queryFn: () => data.listOrganizations() });
}

export function useOrganization(id: string | null) {
  return useQuery({
    queryKey: id ? queryKeys.organization(id) : ['organizations', null],
    queryFn: () => (id ? data.getOrganization(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof data.createOrganization>[0]) => data.createOrganization(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.organizations });
      qc.invalidateQueries({ queryKey: queryKeys.activity() });
    },
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Organization> }) =>
      data.updateOrganization(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.organizations });
      qc.invalidateQueries({ queryKey: queryKeys.activity() });
    },
  });
}

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => data.deleteOrganization(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.organizations });
      qc.invalidateQueries({ queryKey: queryKeys.markers });
      qc.invalidateQueries({ queryKey: queryKeys.territories });
    },
  });
}

export function useMarkers() {
  return useQuery({ queryKey: queryKeys.markers, queryFn: () => data.listMarkers() });
}

export function useCreateMarker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof data.createMarker>[0]) => data.createMarker(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.markers });
      qc.invalidateQueries({ queryKey: queryKeys.activity() });
    },
  });
}

export function useUpdateMarker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<MapMarker> }) =>
      data.updateMarker(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.markers });
    },
  });
}

export function useDeleteMarker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => data.deleteMarker(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.markers });
      qc.invalidateQueries({ queryKey: queryKeys.activity() });
    },
  });
}

export function useTerritories() {
  return useQuery({ queryKey: queryKeys.territories, queryFn: () => data.listTerritories() });
}

export function useCreateTerritory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof data.createTerritory>[0]) => data.createTerritory(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.territories }),
  });
}

export function useDeleteTerritory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => data.deleteTerritory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.territories }),
  });
}

export function useInvestigations() {
  return useQuery({ queryKey: queryKeys.investigations, queryFn: () => data.listInvestigations() });
}

export function useCreateInvestigation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof data.createInvestigation>[0]) =>
      data.createInvestigation(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.investigations });
      qc.invalidateQueries({ queryKey: queryKeys.activity() });
    },
  });
}

export function useUpdateInvestigation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Investigation> }) =>
      data.updateInvestigation(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.investigations });
      qc.invalidateQueries({ queryKey: queryKeys.activity() });
    },
  });
}

export function useOperations() {
  return useQuery({ queryKey: queryKeys.operations, queryFn: () => data.listOperations() });
}

export function useCreateOperation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof data.createOperation>[0]) => data.createOperation(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.operations });
      qc.invalidateQueries({ queryKey: queryKeys.activity() });
    },
  });
}

export function useUpdateOperation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Operation> }) =>
      data.updateOperation(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.operations });
      qc.invalidateQueries({ queryKey: queryKeys.activity() });
    },
  });
}

export function useMissions(organizationId?: string) {
  return useQuery({
    queryKey: queryKeys.missions(organizationId),
    queryFn: () => data.listMissions(organizationId),
  });
}

export function useCreateMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof data.createMission>[0]) => data.createMission(input),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.missions(vars.organization_id) });
      qc.invalidateQueries({ queryKey: queryKeys.missions() });
      qc.invalidateQueries({ queryKey: queryKeys.activity() });
    },
  });
}

export function useDeleteMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => data.deleteMission(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.missions() }),
  });
}

export function useActivity(limit = 50) {
  return useQuery({ queryKey: queryKeys.activity(limit), queryFn: () => data.listActivity(limit) });
}

export function useUploadLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, organizationId }: { file: File; organizationId: string }) =>
      data.uploadLogo(file, organizationId),
    onSuccess: (_url, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.organization(vars.organizationId) });
      qc.invalidateQueries({ queryKey: queryKeys.organizations });
    },
  });
}

export function useUploadMarkerIcon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, markerId }: { file: File; markerId: string }) =>
      data.uploadMarkerIcon(file, markerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.markers });
    },
  });
}
