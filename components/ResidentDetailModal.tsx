'use client';

import React from 'react';
import { Resident, getAge, getKategoriUmur } from '@/types/resident';
import { useResidents } from '@/context/ResidentContext';
import { X, Printer, Edit, User, Home, MapPin, Calendar, Briefcase, Phone, Award } from 'lucide-react';

interface ResidentDetailModalProps {
  resident: Resident | null;
  onClose: () => void;
  onEdit: (resident: Resident) => void;
  onPrint: (resident: Resident) => void;
}

export function ResidentDetailModal({
  resident,
  onClose,
  onEdit,
  onPrint
}: ResidentDetailModalProps) {
  const { villageProfile } = useResidents();
  if (!resident) return null;

  const age = getAge(resident.tanggalLahir);
  const kategori = getKategoriUmur(age);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center text-white font-extrabold text-xl shadow">
              {resident.nama.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white leading-snug">{resident.nama}</h3>
              <p className="text-xs text-emerald-300 font-mono">NIK: {resident.nik}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {/* Identity Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/70">
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">No. KK</span>
              <span className="font-mono font-bold text-slate-900">{resident.noKk}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Hubungan KK</span>
              <span className="font-bold text-emerald-700">{resident.hubunganKk}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Jenis Kelamin</span>
              <span className="font-semibold text-slate-900">{resident.jenisKelamin}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Umur & Kategori</span>
              <span className="font-bold text-slate-900">{age} Th ({kategori})</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Agama</span>
              <span className="font-semibold text-slate-900">{resident.agama}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Status Perkawinan</span>
              <span className="font-semibold text-slate-900">{resident.statusPerkawinan}</span>
              {resident.tanggalPerkawinan && (
                <span className="text-[10px] text-slate-500 block font-mono">({resident.tanggalPerkawinan})</span>
              )}
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-400 block uppercase">Kewarganegaraan</span>
              <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {resident.kewarganegaraan || 'WNI'}
              </span>
            </div>
          </div>

          {/* Detailed Info Groups */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs border-b border-slate-200 pb-1 flex justify-between items-center">
              <span>Data Demografi & Silsilah Orang Tua</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start space-x-2">
                <Calendar className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-500 block">Tempat, Tanggal Lahir</span>
                  <span className="text-slate-900 font-bold">{resident.tempatLahir}, {resident.tanggalLahir}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <User className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-500 block">Orang Tua (Ayah / Ibu)</span>
                  <span className="text-slate-900 font-bold">
                    Ayah: {resident.namaAyah || '-'} <br />
                    Ibu: {resident.namaIbu || '-'}
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Award className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-500 block">Pendidikan terakhir</span>
                  <span className="text-slate-900 font-bold">{resident.pendidikan}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Briefcase className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-500 block">Pekerjaan</span>
                  <span className="text-slate-900 font-bold">{resident.pekerjaan || '-'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Phone className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-500 block">No. HP / Kontak</span>
                  <span className="text-slate-900 font-bold">{resident.noHp || '-'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-2 sm:col-span-2">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-500 block">Alamat Domisili</span>
                  <span className="text-slate-900 font-bold">
                    {resident.alamat} - {resident.dusun} (RT {resident.rt}/RW {resident.rw}), Desa {villageProfile.namaDesa}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onEdit(resident);
            }}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Data</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPrint(resident)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Biodata</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
