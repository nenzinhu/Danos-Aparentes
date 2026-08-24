'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import { supabaseEnabled } from '@/src/lib/supabase';
import type { VehicleInfo } from '@/src/types';

export interface ClientRecord {
  id: string;
  owner: string;
  phone: string;
  cpf?: string | null;
  cnh?: string | null;
  cnhCategory?: string | null;
  plate: string;
  brand: string;
  color: string;
  vehicleTypeDesc: string;
  ano?: string | null;
  km?: string | null;
  city: string;
  state: string;
  profile: string;
  createdAt?: string;
  updatedAt?: string;
}

const LOCAL_KEY = 'da_clients_cache_v1';

type ClientInput = Omit<ClientRecord, 'id' | 'createdAt' | 'updatedAt'>;

function loadLocal(): ClientRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as ClientRecord[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(list: ClientRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota */
  }
}

function vehicleInfoToInput(info: VehicleInfo): ClientInput {
  return {
    owner: info.owner ?? '',
    phone: info.phone ?? '',
    cpf: info.cpf ?? null,
    cnh: info.cnh ?? null,
    cnhCategory: info.cnhCategory ?? null,
    plate: info.plate ?? '',
    brand: info.brand ?? '',
    color: info.color ?? '',
    vehicleTypeDesc: info.vehicleTypeDesc ?? '',
    ano: info.ano ?? null,
    km: info.km ?? null,
    city: info.city ?? '',
    state: info.state ?? '',
    profile: info.profile ?? '',
  }
}

function clientRecordToPatch(record: ClientRecord): Partial<VehicleInfo> {
  return {
    owner: record.owner,
    phone: record.phone,
    cpf: record.cpf ?? undefined,
    cnh: record.cnh ?? undefined,
    cnhCategory: record.cnhCategory ?? undefined,
    plate: record.plate as unknown as VehicleInfo['plate'],
    brand: record.brand,
    color: record.color,
    vehicleTypeDesc: record.vehicleTypeDesc,
    ano: record.ano ?? undefined,
    km: record.km ?? undefined,
    city: record.city,
    state: record.state,
    profile: record.profile,
  }
}

export interface UseClientsResult {
  clients: ClientRecord[];
  loading: boolean;
  error: string | null;
  createOrUpdate: (input: ClientInput) => Promise<ClientRecord | null>;
  remove: (id: string) => Promise<void>;
  getByPlate: (plate: string) => ClientRecord | undefined;
  /** Pré-preenche um VehicleInfo a partir de um cliente (ou do cache local por placa). */
  applyToVehicleInfo: (info: VehicleInfo, record: ClientRecord) => VehicleInfo;
  fromVehicleInfo: (info: VehicleInfo) => ClientInput;
}

export function useClients(userId?: string): UseClientsResult {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(supabaseEnabled);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabaseEnabled || !supabase || !userId) {
      const local = loadLocal();
      setClients(local);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: err } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (err) {
      setError(err.message);
      setClients(loadLocal());
    } else {
      const mapped: ClientRecord[] = (data ?? []).map((r) => ({
        id: r.id,
        owner: r.owner ?? '',
        phone: r.phone ?? '',
        cpf: r.cpf ?? null,
        cnh: r.cnh ?? null,
        cnhCategory: r.cnh_category ?? null,
        plate: r.plate ?? '',
        brand: r.brand ?? '',
        color: r.color ?? '',
        vehicleTypeDesc: r.vehicle_type_desc ?? '',
        ano: r.ano ?? null,
        km: r.km ?? null,
        city: r.city ?? '',
        state: r.state ?? '',
        profile: r.profile ?? '',
        createdAt: r.created_at,
        updatedAt: r.updated_at,
      }));
      setClients(mapped);
      saveLocal(mapped);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!load) return
    void load();
  }, [load]);

  const createOrUpdate = useCallback(
    async (input: ClientInput): Promise<ClientRecord | null> => {
      const normPlate = input.plate.trim().toUpperCase();
      if (!supabaseEnabled || !supabase || !userId) {
        // Offline: apenas cache local (por placa, se houver)
        const local = loadLocal();
        const idx = local.findIndex((c) => c.plate.toUpperCase() === normPlate && normPlate !== '');
        const record: ClientRecord = {
          id: idx >= 0 ? local[idx].id : `local_${Date.now()}`,
          ...input,
          plate: normPlate,
          createdAt: idx >= 0 ? local[idx].createdAt : new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const next = idx >= 0 ? local.map((c, i) => (i === idx ? record : c)) : [record, ...local];
        saveLocal(next);
        setClients(next);
        return record;
      }
      const row = {
        user_id: userId,
        owner: input.owner,
        phone: input.phone,
        cpf: input.cpf ?? null,
        cnh: input.cnh ?? null,
        cnh_category: input.cnhCategory ?? null,
        plate: normPlate,
        brand: input.brand,
        color: input.color,
        vehicle_type_desc: input.vehicleTypeDesc,
        ano: input.ano ?? null,
        km: input.km ?? null,
        city: input.city,
        state: input.state,
        profile: input.profile,
      };
      const { data, error: err } = await supabase
        .from('clients')
        .upsert(row, { onConflict: 'user_id,lower(plate)' })
        .select()
        .single();
      if (err) {
        setError(err.message);
        return null;
      }
      const record: ClientRecord = {
        id: data.id,
        owner: data.owner ?? '',
        phone: data.phone ?? '',
        cpf: data.cpf ?? null,
        cnh: data.cnh ?? null,
        cnhCategory: data.cnh_category ?? null,
        plate: data.plate ?? '',
        brand: data.brand ?? '',
        color: data.color ?? '',
        vehicleTypeDesc: data.vehicle_type_desc ?? '',
        ano: data.ano ?? null,
        km: data.km ?? null,
        city: data.city ?? '',
        state: data.state ?? '',
        profile: data.profile ?? '',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
      setClients((prev) => {
        const idx = prev.findIndex((c) => c.id === record.id);
        const next = idx >= 0 ? prev.map((c, i) => (i === idx ? record : c)) : [record, ...prev];
        saveLocal(next);
        return next;
      });
      return record;
    },
    [userId],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!supabaseEnabled || !supabase || !userId) {
        const next = loadLocal().filter((c) => c.id !== id);
        saveLocal(next);
        setClients(next);
        return;
      }
      const { error: err } = await supabase.from('clients').delete().eq('id', id);
      if (err) setError(err.message);
      setClients((prev) => {
        const next = prev.filter((c) => c.id !== id);
        saveLocal(next);
        return next;
      });
    },
    [userId],
  );

  const getByPlate = useCallback(
    (plate: string): ClientRecord | undefined => {
      const norm = plate.trim().toUpperCase();
      if (!norm) return undefined;
      return clients.find((c) => c.plate.toUpperCase() === norm);
    },
    [clients],
  );

  const applyToVehicleInfo = useCallback((info: VehicleInfo, record: ClientRecord): VehicleInfo => {
    return { ...info, ...clientRecordToPatch(record) };
  }, []);

  const fromVehicleInfo = useCallback((info: VehicleInfo) => vehicleInfoToInput(info), []);

  return useMemo(
    () => ({ clients, loading, error, createOrUpdate, remove, getByPlate, applyToVehicleInfo, fromVehicleInfo }),
    [clients, loading, error, createOrUpdate, remove, getByPlate, applyToVehicleInfo, fromVehicleInfo],
  );
}
