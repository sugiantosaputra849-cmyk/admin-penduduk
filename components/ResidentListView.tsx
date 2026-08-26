'use client';

import React, { useState, useMemo } from 'react';
import { useResidents } from '@/context/ResidentContext';
import { 
  Resident, 
  getAge, 
  getKategoriUmur, 
  JenisKelamin, 
  StatusPenduduk 
} from '@/types/resident';
import { 
  Search, 
  Plus, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Printer, 
  RotateCcw,
  UserCheck,
  Building,
  Calendar,
  Phone,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface ResidentListViewProps {
  onOpenAddModal: () => void;
  onOpenEditModal: (resident: Resident) => void;
  onViewDetail: (resident: Resident) => void;
  onPrintResident: (resident: Resident) => void;
}

export function ResidentListView({
  onOpenAddModal,
  onOpenEditModal,
  onViewDetail,
  onPrintResident
}: ResidentListViewProps) {
  const { 
    residents, 
    deleteResident, 
    searchQuery, 
    setSearchQuery, 
    villageProfile 
  } = useResidents();

  // Filters
  const [filterDusun, setFilterDusun] = useState<string>('Semua');
  const [filterGender, setFilterGender] = useState<string>('Semua');
  const [filterAgeCat, setFilterAgeCat] = useState<string>('Semua');
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [filterPekerjaan, setFilterPekerjaan] = useState<string>('Semua');
  
  // Delete confirm modal state
  const [deletingResident, setDeletingResident] = useState<Resident | null>(null);

  // Extract available unique Dusun & Pekerjaan for select dropdowns
  const availableDusuns = useMemo(() => {
    const dusuns = new Set(residents.map((r) => r.dusun).filter(Boolean));
    return ['Semua', ...Array.from(dusuns)];
  }, [residents]);

  const availableJobs = useMemo(() => {
    const jobs = new Set(residents.map((r) => r.pekerjaan).filter(Boolean));
    return ['Semua', ...Array.from(jobs)];
  }, [residents]);

  // Filtered Residents
  const filteredResidents = useMemo(() => {
    return residents.filter((r) => {
      // Search query filter (NIK, Nama, No. KK, RT, RW, Pekerjaan, Alamat)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery = 
          r.nama.toLowerCase().includes(q) ||
          r.nik.includes(q) ||
          r.noKk.includes(q) ||
          r.pekerjaan.toLowerCase().includes(q) ||
          r.dusun.toLowerCase().includes(q) ||
          (r.namaAyah && r.namaAyah.toLowerCase().includes(q)) ||
          (r.namaIbu && r.namaIbu.toLowerCase().includes(q)) ||
          `rt ${r.rt}`.includes(q) ||
          `rw ${r.rw}`.includes(q);
        if (!matchesQuery) return false;
      }

      // Dusun Filter
      if (filterDusun !== 'Semua' && r.dusun !== filterDusun) return false;

      // Gender Filter
      if (filterGender !== 'Semua' && r.jenisKelamin !== filterGender) return false;

      // Age Category Filter
      if (filterAgeCat !== 'Semua') {
        const age = getAge(r.tanggalLahir);
        const cat = getKategoriUmur(age);
        if (cat !== filterAgeCat) return false;
      }

      // Status Penduduk Filter
      if (filterStatus !== 'Semua' && r.statusPenduduk !== filterStatus) return false;

      // Pekerjaan Filter
      if (filterPekerjaan !== 'Semua' && r.pekerjaan !== filterPekerjaan) return false;

      return true;
    });
  }, [residents, searchQuery, filterDusun, filterGender, filterAgeCat, filterStatus, filterPekerjaan]);

  const resetFilters = () => {
    setSearchQuery('');
    setFilterDusun('Semua');
    setFilterGender('Semua');
    setFilterAgeCat('Semua');
    setFilterStatus('Semua');
    setFilterPekerjaan('Semua');
  };

  const hasActiveFilters = 
    searchQuery || 
    filterDusun !== 'Semua' || 
    filterGender !== 'Semua' || 
    filterAgeCat !== 'Semua' || 
    filterStatus !== 'Semua' ||
    filterPekerjaan !== 'Semua';

  // Export filtered list to Excel
  const handleExportExcel = () => {
    const exportData = filteredResidents.map((r, index) => {
      const age = getAge(r.tanggalLahir);
      return {
        No: index + 1,
        NIK: r.nik,
        'No. KK': r.noKk,
        'Nama Lengkap': r.nama,
        'Tempat Lahir': r.tempatLahir,
        'Tanggal Lahir': r.tanggalLahir,
        'Umur (Tahun)': age,
        'Kategori Umur': getKategoriUmur(age),
        'Jenis Kelamin': r.jenisKelamin,
        Agama: r.agama,
        'Status Perkawinan': r.statusPerkawinan,
        'Tanggal Perkawinan': r.tanggalPerkawinan || '-',
        Kewarganegaraan: r.kewarganegaraan || 'WNI',
        'Nama Ayah': r.namaAyah || '-',
        'Nama Ibu': r.namaIbu || '-',
        Pendidikan: r.pendidikan,
        Pekerjaan: r.pekerjaan,
        'Hubungan dalam KK': r.hubunganKk,
        Alamat: r.alamat,
        Dusun: r.dusun,
        RT: r.rt,
        RW: r.rw,
        'Status Penduduk': r.statusPenduduk,
        'No. HP': r.noHp
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Penduduk');
    XLSX.writeFile(workbook, `Data_Penduduk_Desa_${villageProfile.namaDesa}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-6" id="resident-list-container">
      {/* Top Action & Search Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Data Penduduk Desa {villageProfile.namaDesa}</span>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {filteredResidents.length} Data
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencarian cepat, penyaringan kriteria demografi, edit data, dan cetak lembar penduduk.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs flex items-center space-x-1.5 transition border border-slate-200"
            id="export-excel-btn"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={onOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md hover:shadow-emerald-600/30 flex items-center space-x-1.5 transition"
            id="add-resident-btn"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Penduduk</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3" id="filters-toolbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <Filter className="w-4 h-4 text-emerald-600" />
            <span>Filter Data Penduduk</span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium flex items-center space-x-1"
              id="reset-filters-btn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
          {/* Search Input */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Cari Kata Kunci</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Nama / NIK / KK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                id="resident-search-input"
              />
            </div>
          </div>

          {/* Dusun Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Dusun</label>
            <select
              value={filterDusun}
              onChange={(e) => setFilterDusun(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              id="filter-dusun-select"
            >
              {availableDusuns.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Jenis Kelamin</label>
            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              id="filter-gender-select"
            >
              <option value="Semua">Semua</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          {/* Age Category Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Kategori Umur</label>
            <select
              value={filterAgeCat}
              onChange={(e) => setFilterAgeCat(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              id="filter-age-select"
            >
              <option value="Semua">Semua Umur</option>
              <option value="Balita">Balita (0-5 th)</option>
              <option value="Anak">Anak (6-11 th)</option>
              <option value="Remaja">Remaja (12-17 th)</option>
              <option value="Dewasa">Dewasa (18-59 th)</option>
              <option value="Lansia">Lansia (60+ th)</option>
            </select>
          </div>

          {/* Status Penduduk Filter */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 mb-1">Status Penduduk</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              id="filter-status-select"
            >
              <option value="Semua">Semua Status</option>
              <option value="Tetap">Tetap</option>
              <option value="Kontrak/Sewa">Kontrak/Sewa</option>
              <option value="Pendatang">Pendatang</option>
              <option value="Pindah">Pindah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden" id="residents-table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Nama / NIK</th>
                <th className="py-3 px-3">No. KK</th>
                <th className="py-3 px-3">L/P</th>
                <th className="py-3 px-3">Umur & Kategori</th>
                <th className="py-3 px-3">Dusun / RT / RW</th>
                <th className="py-3 px-3">Pekerjaan</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResidents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <UserCheck className="w-8 h-8 text-slate-300" />
                      <p className="font-semibold text-slate-600">Tidak ada data penduduk yang cocok.</p>
                      <p className="text-xs text-slate-400">Coba ubah kata kunci pencarian atau reset filter.</p>
                      {hasActiveFilters && (
                        <button
                          onClick={resetFilters}
                          className="mt-2 text-xs text-emerald-600 font-semibold hover:underline"
                        >
                          Reset Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResidents.map((r) => {
                  const age = getAge(r.tanggalLahir);
                  const kat = getKategoriUmur(age);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/90 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{r.nama}</div>
                        <div className="font-mono text-[11px] text-slate-500 tracking-wide">NIK: {r.nik}</div>
                        <div className="text-[10px] text-emerald-700 font-medium">{r.hubunganKk}</div>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-slate-600">{r.noKk}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          r.jenisKelamin === 'Laki-laki' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-pink-100 text-pink-800'
                        }`}>
                          {r.jenisKelamin}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">{age} th</div>
                        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          kat === 'Balita' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          kat === 'Anak' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          kat === 'Remaja' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          kat === 'Dewasa' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {kat}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-800">
                        <div className="font-semibold">{r.dusun}</div>
                        <div className="text-[10px] text-slate-500">RT {r.rt} / RW {r.rw}</div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700">
                        <div>{r.pekerjaan || '-'}</div>
                        <div className="text-[10px] text-slate-400">{r.pendidikan}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                          r.statusPenduduk === 'Tetap' ? 'bg-emerald-100 text-emerald-800' :
                          r.statusPenduduk === 'Kontrak/Sewa' ? 'bg-amber-100 text-amber-800' :
                          r.statusPenduduk === 'Pendatang' ? 'bg-blue-100 text-blue-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {r.statusPenduduk}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => onViewDetail(r)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Lihat Detail"
                            id={`view-btn-${r.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(r)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                            title="Edit Data"
                            id={`edit-btn-${r.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPrintResident(r)}
                            className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                            title="Cetak Lembar Warga"
                            id={`print-btn-${r.id}`}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingResident(r)}
                            className="p-1.5 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            title="Hapus Data"
                            id={`delete-btn-${r.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingResident && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Konfirmasi Hapus Penduduk</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus data warga <strong>{deletingResident.nama}</strong> (NIK: {deletingResident.nik}) dari database Desa {villageProfile.namaDesa}?
            </p>
            <div className="bg-rose-50 text-rose-800 p-3 rounded-xl text-xs border border-rose-200">
              ⚠️ Tindakan ini tidak dapat dibatalkan secara langsung. Data akan terhapus dari sistem.
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeletingResident(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteResident(deletingResident.id);
                  setDeletingResident(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow transition"
              >
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
