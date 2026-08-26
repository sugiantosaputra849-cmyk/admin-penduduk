'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Resident, 
  VillageProfile, 
  KartuKeluargaData, 
  getAge, 
  getKategoriUmur 
} from '@/types/resident';
import { DEFAULT_VILLAGE_PROFILE, INITIAL_RESIDENTS } from '@/lib/seed-data';

interface ResidentContextType {
  residents: Resident[];
  villageProfile: VillageProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDusunFilter: string;
  setSelectedDusunFilter: (dusun: string) => void;
  
  // CRUD actions
  addResident: (data: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>) => Resident;
  updateResident: (id: string, data: Partial<Resident>) => void;
  deleteResident: (id: string) => void;
  importResidents: (imported: Resident[], mode: 'append' | 'overwrite') => void;
  updateVillageProfile: (data: Partial<VillageProfile>) => void;
  resetDatabase: () => void;

  // Derived Statistics & KK list
  kartuKeluargaList: KartuKeluargaData[];
  stats: {
    totalPenduduk: number;
    lakiLaki: number;
    perempuan: number;
    jumlahKk: number;
    balita: number;
    anak: number;
    remaja: number;
    dewasa: number;
    lansia: number;
    dusunStats: { name: string; total: number; laki: number; perempuan: number }[];
    pendidikanStats: { name: string; count: number }[];
    pekerjaanStats: { name: string; count: number }[];
  };
}

const STORAGE_KEY_RESIDENTS = 'sipenduk_waihatu_residents_v1';
const STORAGE_KEY_PROFILE = 'sipenduk_waihatu_profile_v1';

const ResidentContext = createContext<ResidentContextType | undefined>(undefined);

export function ResidentProvider({ children }: { children: React.ReactNode }) {
  const [residents, setResidents] = useState<Resident[]>(INITIAL_RESIDENTS);
  const [villageProfile, setVillageProfile] = useState<VillageProfile>(DEFAULT_VILLAGE_PROFILE);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDusunFilter, setSelectedDusunFilter] = useState<string>('Semua');

  // Hydrate from localStorage after mount to prevent hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedResidents = localStorage.getItem(STORAGE_KEY_RESIDENTS);
        if (storedResidents) {
          setResidents(JSON.parse(storedResidents));
        } else {
          localStorage.setItem(STORAGE_KEY_RESIDENTS, JSON.stringify(INITIAL_RESIDENTS));
        }

        const storedProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
        if (storedProfile) {
          setVillageProfile(JSON.parse(storedProfile));
        } else {
          localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(DEFAULT_VILLAGE_PROFILE));
        }
      } catch (e) {
        console.error('LocalStorage load error:', e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Sync to localStorage
  const saveResidents = (updated: Resident[]) => {
    setResidents(updated);
    try {
      localStorage.setItem(STORAGE_KEY_RESIDENTS, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save residents:', err);
    }
  };

  const saveProfile = (updated: VillageProfile) => {
    setVillageProfile(updated);
    try {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  };

  const addResident = (data: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>): Resident => {
    const newId = 'res-' + Date.now();
    const now = new Date().toISOString();
    const newResident: Resident = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now
    };
    const updated = [newResident, ...residents];
    saveResidents(updated);
    return newResident;
  };

  const updateResident = (id: string, data: Partial<Resident>) => {
    const updated = residents.map((r) =>
      r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r
    );
    saveResidents(updated);
  };

  const deleteResident = (id: string) => {
    const updated = residents.filter((r) => r.id !== id);
    saveResidents(updated);
  };

  const importResidents = (imported: Resident[], mode: 'append' | 'overwrite') => {
    if (mode === 'overwrite') {
      saveResidents(imported);
    } else {
      // Append while removing exact duplicate NIKs
      const existingNiks = new Set(residents.map((r) => r.nik));
      const filteredNew = imported.filter((r) => !existingNiks.has(r.nik));
      saveResidents([...filteredNew, ...residents]);
    }
  };

  const updateVillageProfile = (data: Partial<VillageProfile>) => {
    saveProfile({ ...villageProfile, ...data });
  };

  const resetDatabase = () => {
    saveResidents(INITIAL_RESIDENTS);
    saveProfile(DEFAULT_VILLAGE_PROFILE);
  };

  // Derived Kartu Keluarga List
  const kartuKeluargaList = useMemo(() => {
    const kkMap = new Map<string, Resident[]>();
    residents.forEach((r) => {
      const noKk = r.noKk || 'Lainnya';
      if (!kkMap.has(noKk)) {
        kkMap.set(noKk, []);
      }
      kkMap.get(noKk)!.push(r);
    });

    const result: KartuKeluargaData[] = [];
    kkMap.forEach((members, noKk) => {
      // Find Kepala Keluarga or first member
      const kepala = members.find((m) => m.hubunganKk === 'Kepala Keluarga') || members[0];
      result.push({
        noKk,
        kepalaKeluarga: kepala ? kepala.nama : 'Belum Ditentukan',
        nikKepala: kepala ? kepala.nik : '-',
        alamat: kepala ? kepala.alamat : '-',
        dusun: kepala ? kepala.dusun : '-',
        rt: kepala ? kepala.rt : '-',
        rw: kepala ? kepala.rw : '-',
        anggota: members,
        jumlahAnggota: members.length
      });
    });

    return result.sort((a, b) => a.noKk.localeCompare(b.noKk));
  }, [residents]);

  // Calculated Stats
  const stats = useMemo(() => {
    const totalPenduduk = residents.length;
    let lakiLaki = 0;
    let perempuan = 0;
    let balita = 0;
    let anak = 0;
    let remaja = 0;
    let dewasa = 0;
    let lansia = 0;

    const dusunMap = new Map<string, { total: number; laki: number; perempuan: number }>();
    const pendidikanMap = new Map<string, number>();
    const pekerjaanMap = new Map<string, number>();

    residents.forEach((r) => {
      if (r.jenisKelamin === 'Laki-laki') lakiLaki++;
      else if (r.jenisKelamin === 'Perempuan') perempuan++;

      const age = getAge(r.tanggalLahir);
      const kat = getKategoriUmur(age);
      if (kat === 'Balita') balita++;
      else if (kat === 'Anak') anak++;
      else if (kat === 'Remaja') remaja++;
      else if (kat === 'Dewasa') dewasa++;
      else if (kat === 'Lansia') lansia++;

      // Dusun stats
      const dName = r.dusun || 'Lainnya';
      if (!dusunMap.has(dName)) {
        dusunMap.set(dName, { total: 0, laki: 0, perempuan: 0 });
      }
      const dStats = dusunMap.get(dName)!;
      dStats.total += 1;
      if (r.jenisKelamin === 'Laki-laki') dStats.laki += 1;
      else dStats.perempuan += 1;

      // Pendidikan
      const edu = r.pendidikan || 'Tidak/Belum Sekolah';
      pendidikanMap.set(edu, (pendidikanMap.get(edu) || 0) + 1);

      // Pekerjaan
      const job = r.pekerjaan || 'Lainnya';
      pekerjaanMap.set(job, (pekerjaanMap.get(job) || 0) + 1);
    });

    const dusunStats = Array.from(dusunMap.entries()).map(([name, data]) => ({
      name,
      ...data
    }));

    const pendidikanStats = Array.from(pendidikanMap.entries()).map(([name, count]) => ({
      name,
      count
    }));

    const pekerjaanStats = Array.from(pekerjaanMap.entries()).map(([name, count]) => ({
      name,
      count
    }));

    return {
      totalPenduduk,
      lakiLaki,
      perempuan,
      jumlahKk: kartuKeluargaList.length,
      balita,
      anak,
      remaja,
      dewasa,
      lansia,
      dusunStats,
      pendidikanStats,
      pekerjaanStats
    };
  }, [residents, kartuKeluargaList]);

  return (
    <ResidentContext.Provider
      value={{
        residents,
        villageProfile,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        selectedDusunFilter,
        setSelectedDusunFilter,
        addResident,
        updateResident,
        deleteResident,
        importResidents,
        updateVillageProfile,
        resetDatabase,
        kartuKeluargaList,
        stats
      }}
    >
      {children}
    </ResidentContext.Provider>
  );
}

export function useResidents() {
  const context = useContext(ResidentContext);
  if (!context) {
    throw new Error('useResidents must be used within a ResidentProvider');
  }
  return context;
}
