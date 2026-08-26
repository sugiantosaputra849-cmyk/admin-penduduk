'use client';

import React, { useState } from 'react';
import { useResidents } from '@/context/ResidentContext';
import { Resident } from '@/types/resident';
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
  FileCheck
} from 'lucide-react';
import * as XLSX from 'xlsx';

export function ImportExportView() {
  const { residents, importResidents, resetDatabase, villageProfile } = useResidents();

  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  const [importMode, setImportMode] = useState<'append' | 'overwrite'>('append');

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
        {/* Section 1: Excel Import */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Import Data Excel (.xlsx)</h3>
              <p className="text-xs text-slate-500">Unggah berkas Excel berisi daftar warga baru</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
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
                <span>Tambahkan Data (Append)</span>
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
                <span>Ganti Semua Data (Overwrite)</span>
              </label>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition bg-slate-50/50">
              <Upload className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
              <p className="font-bold text-slate-700 text-xs">Klik untuk memilih file Excel atau seret file ke sini</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Mendukung format .xlsx dan .csv</p>
              
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleExcelFileUpload}
                className="hidden"
                id="excel-file-input"
              />
              <label
                htmlFor="excel-file-input"
                className="mt-3 inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs cursor-pointer shadow transition"
              >
                Pilih Berkas Excel
              </label>
            </div>

            <button
              onClick={handleDownloadTemplate}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center space-x-1.5 border border-slate-200"
              id="download-template-btn"
            >
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Download Format Template Excel (.xlsx)</span>
            </button>
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
              <label
                htmlFor="restore-json-input"
                className="w-full block text-center py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl cursor-pointer transition"
              >
                Unggah File Restore (.json)
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
