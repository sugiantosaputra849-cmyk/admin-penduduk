'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Resident, 
  VillageProfile, 
  KartuKeluargaData, 
  AutoBackupConfig,
  BackupSnapshot,
  AdminCredentials,
  getAge, 
  getKategoriUmur 
} from '@/types/resident';
import { DEFAULT_VILLAGE_PROFILE, INITIAL_RESIDENTS, DEFAULT_LOGO_DESA_SVG, DEFAULT_LOGO_KABUPATEN_SVG } from '@/lib/seed-data';
import { exportResidentsToExcel } from '@/lib/excel-helper';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';

interface ResidentContextType {
  residents: Resident[];
  villageProfile: VillageProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedDusunFilter: string;
  setSelectedDusunFilter: (dusun: string) => void;
  
  // Real-time Cloud Sync status
  isCloudSynced: boolean;
  cloudStatusText: string;

  // CRUD actions
  addResident: (data: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>) => Resident;
  updateResident: (id: string, data: Partial<Resident>) => void;
  deleteResident: (id: string) => void;
  importResidents: (imported: Resident[], mode: 'append' | 'overwrite') => void;
  updateVillageProfile: (data: Partial<VillageProfile>) => void;
  resetDatabase: () => void;

  // Backup & Recovery
  autoBackupConfig: AutoBackupConfig;
  updateAutoBackupConfig: (config: Partial<AutoBackupConfig>) => void;
  backupsList: BackupSnapshot[];
  createManualBackup: (label?: string) => BackupSnapshot;
  restoreBackup: (backupId: string) => boolean;
  deleteBackup: (backupId: string) => void;
  triggerExcelBackupNow: () => boolean;
  exportCloudBackupJson: () => void;
  importCloudBackupJson: (jsonString: string) => boolean;

  // Admin Authentication & Protection
  adminCredentials: AdminCredentials;
  isAdminLoggedIn: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  loginAdmin: (username: string, password: string) => boolean;
  logoutAdmin: () => void;
  updateAdminCredentials: (creds: Partial<AdminCredentials>) => void;
  requireAdmin: (action: () => void) => void;

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
const STORAGE_KEY_BACKUPS = 'sipenduk_waihatu_backups_v1';
const STORAGE_KEY_AUTOBACKUP_CONFIG = 'sipenduk_waihatu_autobackup_config_v1';
const STORAGE_KEY_ADMIN_CREDS = 'sipenduk_waihatu_admin_creds_v1';
const STORAGE_KEY_ADMIN_SESSION = 'sipenduk_waihatu_admin_session_v1';

const DEFAULT_AUTOBACKUP_CONFIG: AutoBackupConfig = {
  enabled: true,
  frequency: 'realtime',
  autoDownloadExcel: false,
  cloudSyncEnabled: true,
  lastBackupTime: new Date().toISOString()
};

const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  password: 'admin'
};

const ResidentContext = createContext<ResidentContextType | undefined>(undefined);

export function ResidentProvider({ children }: { children: React.ReactNode }) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [villageProfile, setVillageProfile] = useState<VillageProfile>(DEFAULT_VILLAGE_PROFILE);
  const [autoBackupConfig, setAutoBackupConfig] = useState<AutoBackupConfig>(DEFAULT_AUTOBACKUP_CONFIG);
  const [backupsList, setBackupsList] = useState<BackupSnapshot[]>([]);

  // Cloud Firestore Sync status
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [cloudStatusText, setCloudStatusText] = useState<string>('Menghubungkan ke Cloud Firestore...');

  // Admin Auth State
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials>(DEFAULT_ADMIN_CREDENTIALS);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDusunFilter, setSelectedDusunFilter] = useState<string>('Semua');

  // Hydrate client storage after mount to prevent Next.js SSR hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const storedSession = localStorage.getItem(STORAGE_KEY_ADMIN_SESSION);
        if (storedSession === 'true') {
          setIsAdminLoggedIn(true);
        }
        const storedBackups = localStorage.getItem(STORAGE_KEY_BACKUPS);
        if (storedBackups) {
          setBackupsList(JSON.parse(storedBackups));
        }
      } catch (e) {
        console.error('LocalStorage load error:', e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // REALTIME FIRESTORE SUBSCRIPTIONS
  useEffect(() => {
    // 1. Subscribe to Residents collection
    const residentsCol = collection(db, 'residents');
    const unsubResidents = onSnapshot(residentsCol, (snapshot) => {
      setIsCloudSynced(true);
      setCloudStatusText('Terhubung ke Cloud Database (Sinkronisasi Real-Time)');

      if (snapshot.empty) {
        // First boot: Seed initial residents into Firestore
        const batch = writeBatch(db);
        INITIAL_RESIDENTS.forEach((r) => {
          const docRef = doc(db, 'residents', r.id);
          batch.set(docRef, r);
        });
        batch.commit().catch(err => console.error('Error seeding residents to Firestore:', err));
        setResidents(INITIAL_RESIDENTS);
      } else {
        const loaded: Resident[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push(docSnap.data() as Resident);
        });
        // Sort by updatedAt or createdAt descending
        loaded.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
        setResidents(loaded);
        try {
          localStorage.setItem(STORAGE_KEY_RESIDENTS, JSON.stringify(loaded));
        } catch (e) {
          console.error(e);
        }
      }
    }, (error) => {
      console.error('Firestore residents snapshot error:', error);
      setIsCloudSynced(false);
      setCloudStatusText('Mode Offline / Menggunakan Cache Lokal');
      // Fallback to local storage if Firestore error
      const cached = localStorage.getItem(STORAGE_KEY_RESIDENTS);
      if (cached) {
        setResidents(JSON.parse(cached));
      } else {
        setResidents(INITIAL_RESIDENTS);
      }
    });

    // 2. Subscribe to Village Profile
    const profileRef = doc(db, 'village_profile', 'profile');
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        const parsed = docSnap.data() as VillageProfile;
        setVillageProfile({
          ...DEFAULT_VILLAGE_PROFILE,
          ...parsed,
          logoUrl: (parsed.logoUrl && parsed.logoUrl.trim() !== '') ? parsed.logoUrl : DEFAULT_LOGO_DESA_SVG,
          logoKabupatenUrl: (parsed.logoKabupatenUrl && parsed.logoKabupatenUrl.trim() !== '') ? parsed.logoKabupatenUrl : DEFAULT_LOGO_KABUPATEN_SVG
        });
      } else {
        setDoc(profileRef, DEFAULT_VILLAGE_PROFILE).catch(err => console.error(err));
      }
    });

    // 3. Subscribe to Admin Credentials
    const credsRef = doc(db, 'admin_config', 'credentials');
    const unsubCreds = onSnapshot(credsRef, (docSnap) => {
      if (docSnap.exists()) {
        setAdminCredentials(docSnap.data() as AdminCredentials);
      } else {
        setDoc(credsRef, DEFAULT_ADMIN_CREDENTIALS).catch(err => console.error(err));
      }
    });

    return () => {
      unsubResidents();
      unsubProfile();
      unsubCreds();
    };
  }, []);

  // Helper to persist backup snapshots
  const saveBackups = (newList: BackupSnapshot[]) => {
    const trimmed = newList.slice(0, 12);
    setBackupsList(trimmed);
    try {
      localStorage.setItem(STORAGE_KEY_BACKUPS, JSON.stringify(trimmed));
    } catch (err) {
      console.error('Failed to save backups:', err);
    }
  };

  // Internal auto backup snapshot generator
  const triggerAutoBackupSnapshot = (currentResidents: Resident[], customType: 'auto' | 'pre-import' = 'auto', customLabel?: string) => {
    if (!autoBackupConfig.enabled && customType === 'auto') return;

    const now = new Date();
    const formattedTime = now.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newSnapshot: BackupSnapshot = {
      id: 'bk-' + Date.now(),
      timestamp: now.toISOString(),
      label: customLabel || `Otomatis: Perubahan Database (${currentResidents.length} Warga - ${formattedTime})`,
      count: currentResidents.length,
      sizeKb: Math.round(JSON.stringify(currentResidents).length / 1024 * 10) / 10,
      type: customType,
      residentsData: currentResidents,
      profileData: villageProfile
    };

    const updatedList = [newSnapshot, ...backupsList];
    saveBackups(updatedList);

    const newConfig = { ...autoBackupConfig, lastBackupTime: now.toISOString() };
    setAutoBackupConfig(newConfig);

    if (autoBackupConfig.autoDownloadExcel) {
      exportResidentsToExcel(currentResidents, villageProfile.namaDesa);
    }
  };

  const updateAutoBackupConfig = (config: Partial<AutoBackupConfig>) => {
    const updated = { ...autoBackupConfig, ...config };
    setAutoBackupConfig(updated);
  };

  const createManualBackup = (label?: string): BackupSnapshot => {
    const now = new Date();
    const formattedTime = now.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const newSnapshot: BackupSnapshot = {
      id: 'bk-' + Date.now(),
      timestamp: now.toISOString(),
      label: label || `Backup Manual Admin (${residents.length} Warga - ${formattedTime})`,
      count: residents.length,
      sizeKb: Math.round(JSON.stringify(residents).length / 1024 * 10) / 10,
      type: 'manual',
      residentsData: [...residents],
      profileData: villageProfile
    };

    const updatedList = [newSnapshot, ...backupsList];
    saveBackups(updatedList);
    updateAutoBackupConfig({ lastBackupTime: now.toISOString() });
    return newSnapshot;
  };

  const restoreBackup = (backupId: string): boolean => {
    const target = backupsList.find(b => b.id === backupId);
    if (!target || !target.residentsData) return false;

    triggerAutoBackupSnapshot(residents, 'pre-import', `Cadangan Otomatis Sebelum Restore (${new Date().toLocaleTimeString('id-ID')})`);

    // Sync target residents to Firestore
    const batch = writeBatch(db);
    target.residentsData.forEach((r) => {
      const docRef = doc(db, 'residents', r.id);
      batch.set(docRef, r);
    });
    batch.commit().catch(err => console.error(err));

    if (target.profileData) {
      updateVillageProfile(target.profileData);
    }
    return true;
  };

  const deleteBackup = (backupId: string) => {
    const updated = backupsList.filter(b => b.id !== backupId);
    saveBackups(updated);
  };

  const triggerExcelBackupNow = (): boolean => {
    const success = exportResidentsToExcel(residents, villageProfile.namaDesa);
    if (success) {
      createManualBackup(`Export Excel Manual (${residents.length} Warga)`);
    }
    return success;
  };

  const exportCloudBackupJson = () => {
    const backupPackage = {
      appName: 'SIPENDUK Desa Waihatu',
      exportedAt: new Date().toISOString(),
      villageProfile,
      residentsCount: residents.length,
      residents,
      backupsList
    };

    const jsonStr = JSON.stringify(backupPackage, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SIPENDUK_Cloud_Backup_Desa_${villageProfile.namaDesa}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importCloudBackupJson = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.residents && Array.isArray(parsed.residents)) {
        createManualBackup('Cadangan Sebelum Impor File JSON Cloud');
        
        // Sync imported to Firestore
        const batch = writeBatch(db);
        parsed.residents.forEach((r: Resident) => {
          const docRef = doc(db, 'residents', r.id);
          batch.set(docRef, r);
        });
        batch.commit().catch(err => console.error(err));

        if (parsed.villageProfile) {
          updateVillageProfile({ ...DEFAULT_VILLAGE_PROFILE, ...parsed.villageProfile });
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid JSON backup file:', e);
      return false;
    }
  };

  // Admin Auth Handlers
  const loginAdmin = (username: string, password: string): boolean => {
    if (
      username.trim().toLowerCase() === adminCredentials.username.trim().toLowerCase() &&
      password === adminCredentials.password
    ) {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem(STORAGE_KEY_ADMIN_SESSION, 'true');
      } catch (e) {
        console.error(e);
      }
      setIsAuthModalOpen(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem(STORAGE_KEY_ADMIN_SESSION);
    } catch (e) {
      console.error(e);
    }
  };

  const updateAdminCredentials = (creds: Partial<AdminCredentials>) => {
    const updated = { ...adminCredentials, ...creds };
    setAdminCredentials(updated);
    // Write to Firestore
    const credsRef = doc(db, 'admin_config', 'credentials');
    setDoc(credsRef, updated, { merge: true }).catch(e => console.error(e));
  };

  const requireAdmin = (actionCallback: () => void) => {
    if (isAdminLoggedIn) {
      actionCallback();
    } else {
      setPendingAction(() => actionCallback);
      setIsAuthModalOpen(true);
    }
  };

  // CRUD ACTIONS WRITING DIRECTLY TO FIRESTORE
  const addResident = (data: Omit<Resident, 'id' | 'createdAt' | 'updatedAt'>): Resident => {
    const newId = 'res-' + Date.now();
    const now = new Date().toISOString();
    const newResident: Resident = {
      ...data,
      id: newId,
      createdAt: now,
      updatedAt: now
    };

    // Save directly to Firestore
    const docRef = doc(db, 'residents', newId);
    setDoc(docRef, newResident).catch(e => console.error('Firestore add error:', e));

    triggerAutoBackupSnapshot([newResident, ...residents]);
    return newResident;
  };

  const updateResident = (id: string, data: Partial<Resident>) => {
    const now = new Date().toISOString();
    const updatePayload = { ...data, updatedAt: now };

    const docRef = doc(db, 'residents', id);
    setDoc(docRef, updatePayload, { merge: true }).catch(e => console.error('Firestore update error:', e));

    const updated = residents.map((r) => r.id === id ? { ...r, ...updatePayload } : r);
    triggerAutoBackupSnapshot(updated);
  };

  const deleteResident = (id: string) => {
    const docRef = doc(db, 'residents', id);
    deleteDoc(docRef).catch(e => console.error('Firestore delete error:', e));

    const updated = residents.filter((r) => r.id !== id);
    triggerAutoBackupSnapshot(updated);
  };

  const importResidents = (imported: Resident[], mode: 'append' | 'overwrite') => {
    createManualBackup(`Cadangan Otomatis Sebelum Impor Excel (${mode.toUpperCase()})`);

    if (mode === 'overwrite') {
      // Clear existing in batch then set new
      const batch = writeBatch(db);
      residents.forEach((r) => {
        batch.delete(doc(db, 'residents', r.id));
      });
      imported.forEach((r) => {
        batch.set(doc(db, 'residents', r.id), r);
      });
      batch.commit().catch(e => console.error(e));
    } else {
      const batch = writeBatch(db);
      const existingNiks = new Set(residents.map((r) => r.nik));
      const filteredNew = imported.filter((r) => !existingNiks.has(r.nik));
      filteredNew.forEach((r) => {
        batch.set(doc(db, 'residents', r.id), r);
      });
      batch.commit().catch(e => console.error(e));
    }
  };

  const updateVillageProfile = (data: Partial<VillageProfile>) => {
    const updated = { ...villageProfile, ...data };
    setVillageProfile(updated);
    const profileRef = doc(db, 'village_profile', 'profile');
    setDoc(profileRef, updated, { merge: true }).catch(e => console.error(e));
  };

  const resetDatabase = () => {
    createManualBackup('Cadangan Sebelum Reset Database');
    
    // Clear and set INITIAL_RESIDENTS to Firestore
    const batch = writeBatch(db);
    residents.forEach((r) => {
      batch.delete(doc(db, 'residents', r.id));
    });
    INITIAL_RESIDENTS.forEach((r) => {
      batch.set(doc(db, 'residents', r.id), r);
    });
    batch.commit().catch(e => console.error(e));

    updateVillageProfile(DEFAULT_VILLAGE_PROFILE);
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
        isCloudSynced,
        cloudStatusText,
        addResident,
        updateResident,
        deleteResident,
        importResidents,
        updateVillageProfile,
        resetDatabase,
        autoBackupConfig,
        updateAutoBackupConfig,
        backupsList,
        createManualBackup,
        restoreBackup,
        deleteBackup,
        triggerExcelBackupNow,
        exportCloudBackupJson,
        importCloudBackupJson,
        adminCredentials,
        isAdminLoggedIn,
        isAuthModalOpen,
        setIsAuthModalOpen,
        loginAdmin,
        logoutAdmin,
        updateAdminCredentials,
        requireAdmin,
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
