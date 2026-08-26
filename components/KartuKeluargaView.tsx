'use client';

import React, { useState } from 'react';
import { useResidents } from '@/context/ResidentContext';
import { KartuKeluargaData, Resident, getAge, getKategoriUmur } from '@/types/resident';
import { 
  Home, 
  Users, 
  Search, 
  Printer, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  UserPlus, 
  MapPin, 
  Eye,
  FileText
} from 'lucide-react';

interface KartuKeluargaViewProps {
  onOpenAddMemberForKk: (noKk: string, dusun: string, alamat: string, rt: string, rw: string) => void;
  onPrintKk: (kk: KartuKeluargaData) => void;
  onViewResidentDetail: (resident: Resident) => void;
}

export function KartuKeluargaView({
  onOpenAddMemberForKk,
  onPrintKk,
  onViewResidentDetail
}: KartuKeluargaViewProps) {
  const { kartuKeluargaList, villageProfile } = useResidents();
  const [searchKk, setSearchKk] = useState('');
  const [expandedKk, setExpandedKk] = useState<string | null>(null);

  const filteredKkList = kartuKeluargaList.filter((kk) => {
    if (!searchKk.trim()) return true;
    const q = searchKk.toLowerCase();
    return (
      kk.noKk.includes(q) ||
      kk.kepalaKeluarga.toLowerCase().includes(q) ||
      kk.dusun.toLowerCase().includes(q) ||
      kk.alamat.toLowerCase().includes(q)
    );
  });

  const toggleExpand = (noKk: string) => {
    setExpandedKk(expandedKk === noKk ? null : noKk);
  };

  return (
    <div className="space-y-6" id="kartu-keluarga-container">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Home className="w-5 h-5 text-emerald-600" />
            <span>Data Kartu Keluarga (KK) Desa {villageProfile.namaDesa}</span>
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {kartuKeluargaList.length} KK Terdaftar
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen daftar Kartu Keluarga, susunan anggota keluarga, dan pencetakan data keluarga.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari No. KK / Kepala Keluarga..."
            value={searchKk}
            onChange={(e) => setSearchKk(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            id="search-kk-input"
          />
        </div>
      </div>

      {/* KK Cards Grid / List */}
      <div className="space-y-4" id="kk-list">
        {filteredKkList.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-400">
            <Home className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-600">Tidak ada Kartu Keluarga ditemukan.</p>
          </div>
        ) : (
          filteredKkList.map((kk) => {
            const isExpanded = expandedKk === kk.noKk;

            return (
              <div 
                key={kk.noKk} 
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden transition hover:border-slate-300"
              >
                {/* KK Card Header */}
                <div className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-start space-x-3">
                    <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">No. KK:</span>
                        <span className="font-mono font-bold text-base text-slate-900">{kk.noKk}</span>
                      </div>
                      <h3 className="font-extrabold text-slate-900 text-base mt-0.5">
                        Kepala Keluarga: <span className="text-emerald-700">{kk.kepalaKeluarga}</span>
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{kk.dusun} (RT {kk.rt}/RW {kk.rw})</span>
                        </span>
                        <span>•</span>
                        <span>Alamat: {kk.alamat}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end space-x-2">
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">
                      {kk.jumlahAnggota} Anggota
                    </span>

                    <button
                      onClick={() => onPrintKk(kk)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-xs transition"
                      title="Cetak Format Kartu Keluarga"
                      id={`print-kk-btn-${kk.noKk}`}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak KK</span>
                    </button>

                    <button
                      onClick={() => onOpenAddMemberForKk(kk.noKk, kk.dusun, kk.alamat, kk.rt, kk.rw)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-xs transition"
                      title="Tambah Anggota Keluarga"
                      id={`add-member-kk-btn-${kk.noKk}`}
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>+ Anggota</span>
                    </button>

                    <button
                      onClick={() => toggleExpand(kk.noKk)}
                      className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition"
                      title="Detail Anggota"
                      id={`toggle-kk-btn-${kk.noKk}`}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Members Table */}
                {isExpanded && (
                  <div className="border-t border-slate-200 p-4 bg-white">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                      Daftar Anggota Keluarga ({kk.jumlahAnggota} Orang)
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-100 text-slate-500 border-b border-slate-200 font-semibold">
                            <th className="py-2 px-3">NIK</th>
                            <th className="py-2 px-3">Nama Lengkap</th>
                            <th className="py-2 px-3">Hubungan KK</th>
                            <th className="py-2 px-3">L/P</th>
                            <th className="py-2 px-3">Umur</th>
                            <th className="py-2 px-3">Status Perkawinan</th>
                            <th className="py-2 px-3">Pekerjaan</th>
                            <th className="py-2 px-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {kk.anggota.map((m) => {
                            const age = getAge(m.tanggalLahir);
                            return (
                              <tr key={m.id} className="hover:bg-slate-50">
                                <td className="py-2.5 px-3 font-mono text-slate-600">{m.nik}</td>
                                <td className="py-2.5 px-3 font-bold text-slate-900">{m.nama}</td>
                                <td className="py-2.5 px-3 font-medium text-emerald-700">{m.hubunganKk}</td>
                                <td className="py-2.5 px-3 text-slate-600">{m.jenisKelamin}</td>
                                <td className="py-2.5 px-3 font-semibold text-slate-800">{age} th</td>
                                <td className="py-2.5 px-3 text-slate-600">{m.statusPerkawinan}</td>
                                <td className="py-2.5 px-3 text-slate-600">{m.pekerjaan || '-'}</td>
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    onClick={() => onViewResidentDetail(m)}
                                    className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] rounded font-medium"
                                  >
                                    Detail
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
