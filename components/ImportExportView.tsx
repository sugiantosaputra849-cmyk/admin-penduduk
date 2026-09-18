'use client';

import React, { useState } from 'react';
import { useResidents } from '@/context/ResidentContext';
import { Resident, BackupSnapshot } from '@/types/resident';
import { exportResidentsToExcel } from '@/lib/excel-helper';
import { 
  ArrowUpDown, 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  FileCheck,
  ShieldCheck,
  Clock,
  HardDrive,
  Cloud,
  History,
  RotateCcw,
  Trash2,
  Settings2,
  Save,
  Zap
} from 'lucide-react';
import * as XLSX from 'xlsx';

export function ImportExportView() {
  const { 
    residents, 
    importResidents, 
    resetDatabase, 
    villageProfile,
    autoBackupConfig,
    updateAutoBackupConfig,
    backupsList,
    createManualBackup,
    restoreBackup,
    deleteBackup,
    triggerExcelBackupNow,
    exportCloudBackupJson,
    importCloudBackupJson,
    requireAdmin
  } = useResidents();

  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const [importMode, setImportMode] = useState<'append' | 'overwrite'>('append');

  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Trigger Excel Download and Record Backup Snapshot
  const handleExportAllToExcel = () => {
    if (!residents || residents.length === 0) {
      setImportStatus({
        type: 'error',
        message: 'Tidak ada data penduduk di dalam database untuk diekspor.'
      });
      return;
    }

    const success = triggerExcelBackupNow();
    if (success) {
      setImportStatus({
        type: 'success',
        message: `Berhasil mengunduh seluruh database (${residents.length} data penduduk) ke file Excel (.xlsx). Snapshot backup otomatis telah dicatat.`
      });
    }
  };

  // Trigger Manual Backup Snapshot
  const handleCreateSnapshot = () => {
    requireAdmin(() => {
      const snap = createManualBackup();
      setImportStatus({
        type: 'success',
        message: `Snapshot cadangan manual '${snap.label}' berhasil dibuat & disimpan aman!`
      });
    });
  };

  // Restore snapshot handler
  const handleRestoreSnapshot = (snapshot: BackupSnapshot) => {
    requireAdmin(() => {
      if (window.confirm(`Apakah Anda yakin ingin memulihkan database ke versi '${snapshot.label}' (${snapshot.count} warga)? Data saat ini akan digantikan.`)) {
        setRestoringId(snapshot.id);
        setTimeout(() => {
          const ok = restoreBackup(snapshot.id);
          setRestoringId(null);
          if (ok) {
            setImportStatus({
              type: 'success',
              message: `Database berhasil dipulihkan ke versi '${snapshot.label}' (${snapshot.count} data warga).`
            });
          } else {
            setImportStatus({
              type: 'error',
              message: 'Gagal memulihkan snapshot database. Data tidak ditemukan.'
            });
          }
        }, 300);
      }
    });
  };

  // Download snapshot directly as Excel
  const handleDownloadSnapshotExcel = (snapshot: BackupSnapshot) => {
    if (!snapshot.residentsData || snapshot.residentsData.length === 0) {
      setImportStatus({
        type: 'error',
        message: 'Snapshot ini tidak memiliki data warga untuk diekspor.'
      });
      return;
    }
    const safeDate = snapshot.timestamp.slice(0, 10);
    exportResidentsToExcel(
      snapshot.residentsData, 
      villageProfile.namaDesa, 
      `Backup_Snapshot_Desa_${villageProfile.namaDesa}_${safeDate}_${snapshot.id.slice(-4)}.xlsx`
    );
    setImportStatus({
      type: 'success',
      message: `Berkas Excel dari snapshot '${snapshot.label}' berhasil diunduh.`
    });
  };

  // Download Sample Template for Excel import
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NIK: '8106021205740099',
        No_KK: '8106021501100099',
        Nama_Lengkap: 'Contoh Warga Baru',
        Tempat_Lahir: 'Waihatu',
        Tanggal_Lahir: '1995-06-20',
        Jenis_Kelamin: 'Laki-laki',
        Agama: 'Kristen Protestan',
        Status_Perkawinan: 'Menikah',
        Tanggal_Perkawinan: '2015-08-18',
        Kewarganegaraan: 'WNI',
        Nama_Ayah: 'Nathaniel Tetelepta',
        Nama_Ibu: 'Elizabeth Patty',
        Pendidikan: 'S1',
        Pekerjaan: 'Wirausaha',
        Hubungan_KK: 'Kepala Keluarga',
        Alamat: 'Jl. Merdeka RT 001/RW 001',
        Dusun: 'Dusun Waihatu',
        RT: '001',
        RW: '001',
        Status_Penduduk: 'Tetap',
        No_HP: '081234567890'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template_Penduduk');
    XLSX.writeFile(wb, 'Template_Input_Penduduk_Desa_Waihatu.xlsx');
  };

  // Handle Excel Import
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(worksheet);

        if (!jsonData || jsonData.length === 0) {
          setImportStatus({
            type: 'error',
            message: 'File Excel kosong atau format tidak sesuai.'
          });
          return;
        }

        const now = new Date().toISOString();
        const parsedResidents: Resident[] = jsonData.map((row, idx) => ({
          id: 'imp-' + Date.now() + '-' + idx,
          nik: String(row.NIK || row.nik || '').padStart(16, '0'),
          noKk: String(row.No_KK || row.noKk || row['No. KK'] || '').padStart(16, '0'),
          nama: String(row.Nama_Lengkap || row.nama || row.Nama || 'Tanpa Nama'),
          tempatLahir: String(row.Tempat_Lahir || row.tempatLahir || 'Waihatu'),
          tanggalLahir: String(row.Tanggal_Lahir || row.tanggalLahir || '2000-01-01'),
          jenisKelamin: (row.Jenis_Kelamin || row.jenisKelamin || 'Laki-laki') as any,
          agama: (row.Agama || row.agama || 'Islam') as any,
          statusPerkawinan: (row.Status_Perkawinan || row.statusPerkawinan || 'Belum Menikah') as any,
          tanggalPerkawinan: String(row.Tanggal_Perkawinan || row.tanggalPerkawinan || ''),
          kewarganegaraan: (row.Kewarganegaraan || row.kewarganegaraan || 'WNI') as any,
          namaAyah: String(row.Nama_Ayah || row.namaAyah || '-'),
          namaIbu: String(row.Nama_Ibu || row.namaIbu || '-'),
          pendidikan: (row.Pendidikan || row.pendidikan || 'SMA/SMK') as any,
          pekerjaan: String(row.Pekerjaan || row.pekerjaan || 'Lainnya'),
          hubunganKk: (row.Hubungan_KK || row.hubunganKk || 'Kepala Keluarga') as any,
          alamat: String(row.Alamat || row.alamat || 'Desa Waihatu'),
          dusun: String(row.Dusun || row.dusun || 'Dusun Waihatu'),
          rt: String(row.RT || row.rt || '001'),
          rw: String(row.RW || row.rw || '001'),
          statusPenduduk: (row.Status_Penduduk || row.statusPenduduk || 'Tetap') as any,
          noHp: String(row.No_HP || row.noHp || '-'),
          createdAt: now,
          updatedAt: now
        }));

        importResidents(parsedResidents, importMode);
        setImportStatus({
          type: 'success',
          message: `Berhasil mengimpor ${parsedResidents.length} data penduduk ke dalam database Desa Waihatu.`
        });
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: 'Gagal memproses file Excel: ' + (err.message || 'Format tidak valid')
        });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Full Export JSON Backup
  const handleBackupJson = () => {
    const backupObj = {
      appName: 'SIPENDUK Desa Waihatu',
      version: '1.2',
      exportedAt: new Date().toISOString(),
      villageProfile,
      residentsCount: residents.length,
      residents
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Backup_SIPENDUK_Waihatu_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Restore JSON Backup
  const handleRestoreJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && Array.isArray(json.residents)) {
          importResidents(json.residents, 'overwrite');
          setImportStatus({
            type: 'success',
            message: `Berhasil merestore ${json.residents.length} data penduduk dari file backup JSON.`
          });
        } else {
          setImportStatus({
            type: 'error',
            message: 'File JSON backup tidak mempunyai struktur data penduduk yang sah.'
          });
        }
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: 'Gagal merestore file JSON: ' + err.message
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6" id="import-export-container">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <ArrowUpDown className="w-5 h-5 text-emerald-600" />
          <span>Manajemen Import, Export & Backup Data</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Fasilitas impor data masal Excel, ekspor laporan spreadsheet, serta pencadangan data JSON lokal.
        </p>
      </div>

      {/* Status Alert if any */}
      {importStatus.type && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
          importStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          importStatus.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-center space-x-2">
            {importStatus.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
            <span className="font-semibold">{importStatus.message}</span>
          </div>
          <button 
            onClick={() => setImportStatus({ type: null, message: '' })}
            className="text-xs font-bold hover:underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Grid Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Excel Integration & Export/Import */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Koneksi Database & Excel</h3>
              <p className="text-xs text-slate-500">Ekspor atau impor data penduduk dengan Microsoft Excel (.xlsx)</p>
            </div>
          </div>

          <div className="space-y-4 pt-1">
            {/* Export All Database to Excel */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950 text-xs flex items-center space-x-1.5">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>Ekspor Seluruh Database Penduduk Ke Excel</span>
                </span>
                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                  {residents.length} Data
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Unduh seluruh isi database penduduk Desa Waihatu saat ini lengkap dengan NIK, No. KK, Tanggal Perkawinan, Kewarganegaraan, dan Nama Orang Tua ke berkas Excel (.xlsx).
              </p>
              <button
                onClick={handleExportAllToExcel}
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center space-x-2"
                id="export-all-excel-btn"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Unduh Seluruh Database Ke Excel (.xlsx)</span>
              </button>
            </div>

            {/* Import Excel */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Impor / Sinkronisasi Data Excel ke Database</span>
              </span>

              <div className="flex items-center space-x-4 text-xs">
                <span className="font-semibold text-slate-700">Mode Impor:</span>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Tambahkan (Append)</span>
                </label>
                <label className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="overwrite"
                    checked={importMode === 'overwrite'}
                    onChange={() => setImportMode('overwrite')}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Ganti Semua (Overwrite)</span>
                </label>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-emerald-500 transition bg-white">
                <Upload className="w-6 h-6 mx-auto text-emerald-600 mb-1" />
                <p className="font-bold text-slate-700 text-xs">Pilih berkas Excel untuk diimpor</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Format .xlsx atau .csv</p>
                
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleExcelFileUpload}
                  className="hidden"
                  id="excel-file-input"
                />
                <button
                  type="button"
                  onClick={() => requireAdmin(() => document.getElementById('excel-file-input')?.click())}
                  className="mt-2 inline-block px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs cursor-pointer shadow transition"
                  id="select-excel-btn"
                >
                  Pilih Berkas Excel
                </button>
              </div>

              <button
                onClick={handleDownloadTemplate}
                className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 border border-slate-300"
                id="download-template-btn"
              >
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Download Template Standar Excel (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Backup & Restore JSON */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 text-blue-800 rounded-xl">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Backup & Restore Database</h3>
              <p className="text-xs text-slate-500">Cadangkan atau pulihkan seluruh database SIPENDUK</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-1">
                <Download className="w-4 h-4 text-blue-600" />
                <span>Pencadangan Data (Backup JSON)</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Unduh salinan cadangan lengkap seluruh data penduduk ({residents.length} data) dan konfigurasi desa ke file JSON.
              </p>
              <button
                onClick={handleBackupJson}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition"
                id="backup-json-btn"
              >
                Unduh File Backup Database (.json)
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-800 text-xs flex items-center space-x-1">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Pemulihan Data (Restore JSON)</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                Pulihkan data dari file backup JSON sebelumnya.
              </p>
              
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreJson}
                className="hidden"
                id="restore-json-input"
              />
              <button
                type="button"
                onClick={() => requireAdmin(() => document.getElementById('restore-json-input')?.click())}
                className="w-full block text-center py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl cursor-pointer transition"
                id="select-json-btn"
              >
                Unggah File Restore (.json)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Guide Card: Panduan Integrasi Database ↔ Excel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Panduan Format & Pemetaaan Kolom Excel Ke Database</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Sistem SIPENDUK mendukung impor & ekspor data secara otomatis. Saat mengimpor berkas Excel (.xlsx / .csv), pastikan baris pertama (header) menggunakan nama kolom berikut:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-2">Nama Kolom Excel</th>
                <th className="p-2">Atribut Database</th>
                <th className="p-2">Format / Nilai Valid</th>
                <th className="p-2">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-2 font-mono font-bold text-emerald-800">NIK</td>
                <td className="p-2 font-mono">nik</td>
                <td className="p-2">16 Digit Angka</td>
                <td className="p-2 text-slate-500">Nomor Induk Kependudukan Wajib</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="p-2 font-mono font-bold text-emerald-800">No_KK</td>
                <td className="p-2 font-mono">noKk</td>
                <td className="p-2">16 Digit Angka</td>
                <td className="p-2 text-slate-500">Nomor Kartu Keluarga Wajib</td>
              </tr>
              <tr>
                <td className="p-2 font-mono font-bold text-emerald-800">Nama_Lengkap</td>
                <td className="p-2 font-mono">nama</td>
                <td className="p-2">Teks (Nama Warga)</td>
                <td className="p-2 text-slate-500">Nama lengkap sesuai KTP/KK</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="p-2 font-mono font-bold text-emerald-800">Tanggal_Lahir</td>
                <td className="p-2 font-mono">tanggalLahir</td>
                <td className="p-2">YYYY-MM-DD</td>
                <td className="p-2 text-slate-500">Format tanggal ISO (misal: 1990-05-15)</td>
              </tr>
              <tr>
                <td className="p-2 font-mono font-bold text-emerald-800">Jenis_Kelamin</td>
                <td className="p-2 font-mono">jenisKelamin</td>
                <td className="p-2">Laki-laki / Perempuan</td>
                <td className="p-2 text-slate-500">Pilihan jenis kelamin</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="p-2 font-mono font-bold text-emerald-800">Kewarganegaraan</td>
                <td className="p-2 font-mono">kewarganegaraan</td>
                <td className="p-2">WNI / WNA</td>
                <td className="p-2 text-slate-500">Status kewarganegaraan (default: WNI)</td>
              </tr>
              <tr>
                <td className="p-2 font-mono font-bold text-emerald-800">Nama_Ayah / Nama_Ibu</td>
                <td className="p-2 font-mono">namaAyah / namaIbu</td>
                <td className="p-2">Teks Nama Orang Tua</td>
                <td className="p-2 text-slate-500">Diisi nama lengkap Ayah/Ibu kandung</td>
              </tr>
              <tr className="bg-slate-50/50">
                <td className="p-2 font-mono font-bold text-emerald-800">Hubungan_KK</td>
                <td className="p-2 font-mono">hubunganKk</td>
                <td className="p-2">Kepala Keluarga / Istri / Anak / dll</td>
                <td className="p-2 text-slate-500">Kedudukan dalam Kartu Keluarga</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
