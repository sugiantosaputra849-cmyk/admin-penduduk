'use client';

import React, { useState } from 'react';
import { ResidentProvider, useResidents } from '@/context/ResidentContext';
import { HeaderSidebar } from '@/components/HeaderSidebar';
import { DashboardView } from '@/components/DashboardView';
import { ResidentListView } from '@/components/ResidentListView';
import { KartuKeluargaView } from '@/components/KartuKeluargaView';
import { LaporanView } from '@/components/LaporanView';
import { ImportExportView } from '@/components/ImportExportView';
import { SettingsView } from '@/components/SettingsView';
import { ResidentModal } from '@/components/ResidentModal';
import { ResidentDetailModal } from '@/components/ResidentDetailModal';
import { PrintModal, PrintMode } from '@/components/PrintModal';
import { Resident, KartuKeluargaData } from '@/types/resident';

function AppContent() {
  const { activeTab } = useResidents();

  // Modal states
  const [isResidentModalOpen, setIsResidentModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);

  // Pre-fill parameters for KK member addition
  const [kkModalDefaults, setKkModalDefaults] = useState<{
    noKk: string;
    dusun: string;
    alamat: string;
    rt: string;
    rw: string;
  }>({
    noKk: '',
    dusun: 'Dusun Waihatu',
    alamat: '',
    rt: '001',
    rw: '001'
  });

  // Detail Modal state
  const [detailResident, setDetailResident] = useState<Resident | null>(null);

  // Print Modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printMode, setPrintMode] = useState<PrintMode>('single-resident');
  const [printResidentData, setPrintResidentData] = useState<Resident | null>(null);
  const [printKkData, setPrintKkData] = useState<KartuKeluargaData | null>(null);
  const [printReportTitle, setPrintReportTitle] = useState('');
  const [printReportList, setPrintReportList] = useState<Resident[]>([]);
  const [printKkListReport, setPrintKkListReport] = useState<KartuKeluargaData[]>([]);

  // Action Handlers
  const handleOpenAddModal = () => {
    setEditingResident(null);
    setKkModalDefaults({
      noKk: '',
      dusun: 'Dusun Waihatu',
      alamat: 'Jl. Trans Seram - Waihatu',
      rt: '001',
      rw: '001'
    });
    setIsResidentModalOpen(true);
  };

  const handleOpenEditModal = (resident: Resident) => {
    setEditingResident(resident);
    setIsResidentModalOpen(true);
  };

  const handleOpenAddMemberForKk = (
    noKk: string,
    dusun: string,
    alamat: string,
    rt: string,
    rw: string
  ) => {
    setEditingResident(null);
    setKkModalDefaults({ noKk, dusun, alamat, rt, rw });
    setIsResidentModalOpen(true);
  };

  const handlePrintSingleResident = (resident: Resident) => {
    setPrintMode('single-resident');
    setPrintResidentData(resident);
    setIsPrintModalOpen(true);
  };

  const handlePrintKk = (kk: KartuKeluargaData) => {
    setPrintMode('family-card');
    setPrintKkData(kk);
    setIsPrintModalOpen(true);
  };

  const handlePrintReport = (title: string, data: Resident[], label: string) => {
    setPrintMode('report');
    setPrintReportTitle(title);
    setPrintReportList(data);
    setIsPrintModalOpen(true);
  };

  const handlePrintKkReport = (kkList: KartuKeluargaData[]) => {
    setPrintMode('kk-report');
    setPrintKkListReport(kkList);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans text-slate-800 antialiased">
      {/* Sidebar & Navigation */}
      <HeaderSidebar onOpenAddModal={handleOpenAddModal} />

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <DashboardView
            onOpenAddModal={handleOpenAddModal}
            onViewResidentDetail={(r) => setDetailResident(r)}
          />
        )}

        {activeTab === 'penduduk' && (
          <ResidentListView
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={handleOpenEditModal}
            onViewDetail={(r) => setDetailResident(r)}
            onPrintResident={handlePrintSingleResident}
          />
        )}

        {activeTab === 'kk' && (
          <KartuKeluargaView
            onOpenAddMemberForKk={handleOpenAddMemberForKk}
            onPrintKk={handlePrintKk}
            onViewResidentDetail={(r) => setDetailResident(r)}
          />
        )}

        {activeTab === 'laporan' && (
          <LaporanView
            onPrintReport={handlePrintReport}
            onPrintKkReport={handlePrintKkReport}
          />
        )}

        {activeTab === 'import-export' && <ImportExportView />}

        {activeTab === 'pengaturan' && <SettingsView />}
      </main>

      {/* Shared Modals */}
      <ResidentModal
        key={editingResident ? `edit-${editingResident.id}` : `add-${kkModalDefaults.noKk}-${isResidentModalOpen}`}
        isOpen={isResidentModalOpen}
        onClose={() => setIsResidentModalOpen(false)}
        initialData={editingResident}
        defaultNoKk={kkModalDefaults.noKk}
        defaultDusun={kkModalDefaults.dusun}
        defaultAlamat={kkModalDefaults.alamat}
        defaultRt={kkModalDefaults.rt}
        defaultRw={kkModalDefaults.rw}
      />

      <ResidentDetailModal
        resident={detailResident}
        onClose={() => setDetailResident(null)}
        onEdit={(r) => handleOpenEditModal(r)}
        onPrint={(r) => handlePrintSingleResident(r)}
      />

      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        mode={printMode}
        residentData={printResidentData}
        kkData={printKkData}
        reportTitle={printReportTitle}
        reportList={printReportList}
        kkListReport={printKkListReport}
      />
    </div>
  );
}

export default function Home() {
  return (
    <ResidentProvider>
      <AppContent />
    </ResidentProvider>
  );
}
