'use client';

import React, { useState, useMemo } from 'react';
import { useResidents } from '@/context/ResidentContext';
import { Resident, getAge, getKategoriUmur, KartuKeluargaData } from '@/types/resident';
import { 
  FileText, 
  Printer, 
  FileSpreadsheet, 
  Download, 
  Filter, 
  CheckCircle,
  Building2,
  Users,
  Calendar
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface LaporanViewProps {
  onPrintReport: (title: string, data: Resident[], categoryLabel: string) => void;
  onPrintKkReport: (kkList: KartuKeluargaData[]) => void;
}

export function LaporanView({ onPrintReport, onPrintKkReport }: LaporanViewProps) {
  const { residents, kartuKeluargaList, villageProfile } = useResidents();

  // Selected Report Category
  const [reportType, setReportType] = useState<string>('semua');
  const [selectedSubFilter, setSelectedSubFilter] = useState<string>('Semua');

  // Available options based on selected report type
  const availableSubOptions = useMemo(() => {
    if (reportType === 'gender') return ['Semua', 'Laki-laki', 'Perempuan'];
    if (reportType === 'umur') return ['Semua', 'Balita (0-5 th)', 'Anak (6-11 th)', 'Remaja (12-17 th)', 'Dewasa (18-59 th)', 'Lansia (60+ th)'];
    if (reportType === 'pendidikan') {
      const p = new Set(residents.map((r) => r.pendidikan).filter(Boolean));
      return ['Semua', ...Array.from(p)];
    }
    if (reportType === 'pekerjaan') {
      const p = new Set(residents.map((r) => r.pekerjaan).filter(Boolean));
      return ['Semua', ...Array.from(p)];
    }
    if (reportType === 'dusun') {
      const d = new Set(residents.map((r) => r.dusun).filter(Boolean));
      return ['Semua', ...Array.from(d)];
    }
    if (reportType === 'kawin') return ['Semua', 'Belum Menikah', 'Menikah', 'Cerai Hidup', 'Cerai Mati'];
    if (reportType === 'kewarganegaraan') return ['Semua', 'WNI', 'WNA'];
    return ['Semua'];
  }, [reportType, residents]);

  // Filtered dataset for report
  const filteredReportData = useMemo(() => {
    if (reportType === 'kk') return []; // Handled separately

    return residents.filter((r) => {
      const age = getAge(r.tanggalLahir);
      const kat = getKategoriUmur(age);

      if (reportType === 'gender') {
        if (selectedSubFilter !== 'Semua' && r.jenisKelamin !== selectedSubFilter) return false;
      } else if (reportType === 'umur') {
        if (selectedSubFilter === 'Balita (0-5 th)' && kat !== 'Balita') return false;
        if (selectedSubFilter === 'Anak (6-11 th)' && kat !== 'Anak') return false;
        if (selectedSubFilter === 'Remaja (12-17 th)' && kat !== 'Remaja') return false;
        if (selectedSubFilter === 'Dewasa (18-59 th)' && kat !== 'Dewasa') return false;
        if (selectedSubFilter === 'Lansia (60+ th)' && kat !== 'Lansia') return false;
      } else if (reportType === 'pendidikan') {
        if (selectedSubFilter !== 'Semua' && r.pendidikan !== selectedSubFilter) return false;
      } else if (reportType === 'pekerjaan') {
        if (selectedSubFilter !== 'Semua' && r.pekerjaan !== selectedSubFilter) return false;
      } else if (reportType === 'dusun') {
        if (selectedSubFilter !== 'Semua' && r.dusun !== selectedSubFilter) return false;
      } else if (reportType === 'kawin') {
        if (selectedSubFilter !== 'Semua' && r.statusPerkawinan !== selectedSubFilter) return false;
      } else if (reportType === 'kewarganegaraan') {
        if (selectedSubFilter !== 'Semua' && (r.kewarganegaraan || 'WNI') !== selectedSubFilter) return false;
      }
      return true;
    });
  }, [reportType, selectedSubFilter, residents]);

  const getReportTitle = () => {
    switch (reportType) {
      case 'semua': return 'Laporan Daftar Seluruh Penduduk';
      case 'gender': return `Laporan Penduduk Berdasarkan Jenis Kelamin (${selectedSubFilter})`;
      case 'umur': return `Laporan Penduduk Berdasarkan Kategori Umur (${selectedSubFilter})`;
      case 'pendidikan': return `Laporan Penduduk Berdasarkan Tingkat Pendidikan (${selectedSubFilter})`;
      case 'pekerjaan': return `Laporan Penduduk Berdasarkan Jenis Pekerjaan (${selectedSubFilter})`;
      case 'dusun': return `Laporan Penduduk Berdasarkan Dusun (${selectedSubFilter})`;
      case 'kawin': return `Laporan Penduduk Berdasarkan Status Perkawinan (${selectedSubFilter})`;
      case 'kewarganegaraan': return `Laporan Penduduk Berdasarkan Kewarganegaraan (${selectedSubFilter})`;
      case 'kk': return 'Laporan Rekapitulasi Data Kartu Keluarga (KK)';
      default: return 'Laporan Data Penduduk';
    }
  };

  const handleExportReportExcel = () => {
    let exportRows: any[] = [];
    if (reportType === 'kk') {
      exportRows = kartuKeluargaList.map((kk, idx) => ({
        No: idx + 1,
        'No. KK': kk.noKk,
        'Kepala Keluarga': kk.kepalaKeluarga,
        'NIK Kepala': kk.nikKepala,
        Dusun: kk.dusun,
        Alamat: kk.alamat,
        RT: kk.rt,
        RW: kk.rw,
        'Jumlah Anggota': kk.jumlahAnggota
      }));
    } else {
      exportRows = filteredReportData.map((r, idx) => {
        const age = getAge(r.tanggalLahir);
        return {
          No: idx + 1,
          NIK: r.nik,
          'No. KK': r.noKk,
          Nama: r.nama,
          'L/P': r.jenisKelamin,
          'Tempat/Tgl Lahir': `${r.tempatLahir}, ${r.tanggalLahir}`,
          Umur: age,
          'Kategori Umur': getKategoriUmur(age),
          Agama: r.agama,
          Pendidikan: r.pendidikan,
          Pekerjaan: r.pekerjaan,
          'Status Perkawinan': r.statusPerkawinan,
          'Tanggal Perkawinan': r.tanggalPerkawinan || '-',
          Kewarganegaraan: r.kewarganegaraan || 'WNI',
          'Nama Ayah': r.namaAyah || '-',
          'Nama Ibu': r.namaIbu || '-',
          Dusun: r.dusun,
          RT: r.rt,
          RW: r.rw,
          'Status Penduduk': r.statusPenduduk
        };
      });
    }

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    XLSX.writeFile(wb, `${getReportTitle().replace(/[/\\?%*:|"<>]/g, '_')}.xlsx`);
  };

  return (
    <div className="space-y-6" id="laporan-container">
      {/* Page Title */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Pusat Laporan & Cetak Data Desa {villageProfile.namaDesa}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Buat laporan spesifik berdasarkan demografi, cetak dokumen resmi dengan KOP Desa Waihatu, dan ekspor ke Excel.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportReportExcel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-200"
            id="export-report-excel-btn"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => {
              if (reportType === 'kk') {
                onPrintKkReport(kartuKeluargaList);
              } else {
                onPrintReport(getReportTitle(), filteredReportData, selectedSubFilter);
              }
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md transition"
            id="print-report-btn"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF Laporan</span>
          </button>
        </div>
      </div>

      {/* Category Selection Tabs */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Pilih Kategori Laporan:
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-2 text-xs">
          {[
            { id: 'semua', label: 'Daftar Seluruh Penduduk' },
            { id: 'gender', label: 'Jenis Kelamin' },
            { id: 'umur', label: 'Kategori Umur' },
            { id: 'pendidikan', label: 'Pendidikan' },
            { id: 'pekerjaan', label: 'Pekerjaan' },
            { id: 'dusun', label: 'Berdasarkan Dusun' },
            { id: 'kawin', label: 'Status Perkawinan' },
            { id: 'kewarganegaraan', label: 'Kewarganegaraan' },
            { id: 'kk', label: 'Data Kartu Keluarga' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setReportType(cat.id);
                setSelectedSubFilter('Semua');
              }}
              className={`p-2.5 rounded-xl font-semibold text-center transition flex flex-col items-center justify-center space-y-1 ${
                reportType === cat.id
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 ring-offset-1'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
              id={`report-cat-${cat.id}`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Sub-filter if applicable */}
        {reportType !== 'semua' && reportType !== 'kk' && (
          <div className="pt-3 border-t border-slate-100 flex items-center space-x-3 text-xs">
            <span className="font-semibold text-slate-600">Sub Filter ({reportType}):</span>
            <select
              value={selectedSubFilter}
              onChange={(e) => setSelectedSubFilter(e.target.value)}
              className="py-1.5 px-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              id="report-subfilter-select"
            >
              {availableSubOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Live Preview Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5" id="report-preview-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">{getReportTitle()}</h3>
            <p className="text-xs text-slate-500">
              Desa {villageProfile.namaDesa}, Kec. {villageProfile.kecamatan}, Kab. {villageProfile.kabupaten}
            </p>
          </div>
          <div className="mt-2 sm:mt-0 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800">
            Total Record: {reportType === 'kk' ? kartuKeluargaList.length : filteredReportData.length} Data
          </div>
        </div>

        {/* Report Preview Table */}
        <div className="overflow-x-auto">
          {reportType === 'kk' ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">No. Kartu Keluarga</th>
                  <th className="py-2.5 px-3">Kepala Keluarga</th>
                  <th className="py-2.5 px-3">NIK Kepala</th>
                  <th className="py-2.5 px-3">Dusun / RT / RW</th>
                  <th className="py-2.5 px-3">Jumlah Anggota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {kartuKeluargaList.map((kk, idx) => (
                  <tr key={kk.noKk} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{kk.noKk}</td>
                    <td className="py-2.5 px-3 font-semibold text-emerald-800">{kk.kepalaKeluarga}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{kk.nikKepala}</td>
                    <td className="py-2.5 px-3 text-slate-700">{kk.dusun} (RT {kk.rt}/RW {kk.rw})</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{kk.jumlahAnggota} Orang</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold">
                  <th className="py-2.5 px-3">No</th>
                  <th className="py-2.5 px-3">NIK</th>
                  <th className="py-2.5 px-3">Nama Lengkap</th>
                  <th className="py-2.5 px-3">L/P</th>
                  <th className="py-2.5 px-3">Umur</th>
                  <th className="py-2.5 px-3">Dusun / RT / RW</th>
                  <th className="py-2.5 px-3">Pendidikan</th>
                  <th className="py-2.5 px-3">Pekerjaan</th>
                  <th className="py-2.5 px-3">Status Kawin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReportData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-400">
                      Tidak ada data penduduk yang cocok dengan filter laporan ini.
                    </td>
                  </tr>
                ) : (
                  filteredReportData.map((r, idx) => {
                    const age = getAge(r.tanggalLahir);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{r.nik}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{r.nama}</td>
                        <td className="py-2.5 px-3">{r.jenisKelamin}</td>
                        <td className="py-2.5 px-3 font-semibold">{age} th</td>
                        <td className="py-2.5 px-3 text-slate-700">{r.dusun} (RT {r.rt}/RW {r.rw})</td>
                        <td className="py-2.5 px-3 text-slate-600">{r.pendidikan}</td>
                        <td className="py-2.5 px-3 text-slate-600">{r.pekerjaan || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-600">{r.statusPerkawinan}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
