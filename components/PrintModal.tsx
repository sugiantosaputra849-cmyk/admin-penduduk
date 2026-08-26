'use client';

import React from 'react';
import { Resident, KartuKeluargaData, getAge, getKategoriUmur } from '@/types/resident';
import { useResidents } from '@/context/ResidentContext';
import { Printer, X, Download } from 'lucide-react';

export type PrintMode = 'single-resident' | 'family-card' | 'report' | 'kk-report';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: PrintMode;
  residentData?: Resident | null;
  kkData?: KartuKeluargaData | null;
  reportTitle?: string;
  reportList?: Resident[];
  kkListReport?: KartuKeluargaData[];
}

export function PrintModal({
  isOpen,
  onClose,
  mode,
  residentData,
  kkData,
  reportTitle = 'LAPORAN DATA PENDUDUK',
  reportList = [],
  kkListReport = []
}: PrintModalProps) {
  const { villageProfile } = useResidents();
  if (!isOpen) return null;

  const handleTriggerPrint = () => {
    window.print();
  };

  const currentDateFormatted = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        {/* Modal Controls Header (Screen only) */}
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between print:hidden">
          <div>
            <h3 className="font-extrabold text-sm tracking-wide">Pratinjau Dokumen Cetak</h3>
            <p className="text-xs text-slate-400">Pemerintah Desa {villageProfile.namaDesa}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleTriggerPrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow transition"
              id="modal-trigger-print-btn"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Canvas Area */}
        <div className="p-6 md:p-10 overflow-y-auto flex-1 text-slate-900 bg-white" id="printable-area">
          {/* Official KOP SURAT DESA WAIHATU */}
          <div className="border-b-4 border-double border-slate-900 pb-3 mb-6 relative flex items-center justify-between gap-2">
            {/* Logo Kiri: Logo Kabupaten */}
            <div className="w-16 sm:w-20 h-20 flex items-center justify-center shrink-0">
              {villageProfile.logoKabupatenUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={villageProfile.logoKabupatenUrl} 
                  alt="Logo Kabupaten" 
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 font-semibold text-center p-1">
                  Logo Kab
                </div>
              )}
            </div>

            {/* Middle Kop Text */}
            <div className="text-center px-1 flex-1">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-800">
                PEMERINTAH KABUPATEN {villageProfile.kabupaten.toUpperCase()}
              </div>
              <div className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-slate-800 mt-0.5">
                KECAMATAN {villageProfile.kecamatan.toUpperCase()}
              </div>
              <div className="text-lg sm:text-2xl font-black uppercase tracking-wider text-slate-900 mt-0.5">
                PEMERINTAH DESA {villageProfile.namaDesa.toUpperCase()}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-600 font-medium mt-1">
                {villageProfile.alamatKantor} • Kode Pos {villageProfile.kodePos}
              </div>
              {villageProfile.emailDesa && (
                <div className="text-[9px] sm:text-[10px] text-slate-500">
                  Email: {villageProfile.emailDesa} | Telp: {villageProfile.teleponDesa}
                </div>
              )}
            </div>

            {/* Logo Kanan: Logo Desa */}
            <div className="w-16 sm:w-20 h-20 flex items-center justify-center shrink-0">
              {villageProfile.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={villageProfile.logoUrl} 
                  alt="Logo Desa" 
                  className="max-h-20 max-w-full object-contain"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 font-semibold text-center p-1">
                  Logo Desa
                </div>
              )}
            </div>
          </div>

          {/* DOKUMEN 1: Single Resident Biodata */}
          {mode === 'single-resident' && residentData && (
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h2 className="text-base font-bold uppercase underline tracking-wider">
                  BIODATA PENDUDUK DESA
                </h2>
                <p className="text-xs text-slate-600 font-mono">
                  Nomor: 470 / {residentData.nik.slice(-4)} / WHT / {new Date().getFullYear()}
                </p>
              </div>

              <table className="w-full text-xs border-collapse border border-slate-300">
                <tbody>
                  <tr className="bg-slate-50 border-b border-slate-300">
                    <td className="p-2.5 font-bold w-1/3">NIK (Nomor Induk Kependudukan)</td>
                    <td className="p-2.5 font-mono font-bold text-sm">{residentData.nik}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 font-bold">No. Kartu Keluarga (KK)</td>
                    <td className="p-2.5 font-mono">{residentData.noKk}</td>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-300">
                    <td className="p-2.5 font-bold">Nama Lengkap</td>
                    <td className="p-2.5 font-bold text-sm text-emerald-900">{residentData.nama}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 font-bold">Tempat, Tanggal Lahir</td>
                    <td className="p-2.5">{residentData.tempatLahir}, {residentData.tanggalLahir}</td>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-300">
                    <td className="p-2.5 font-bold">Umur / Kategori</td>
                    <td className="p-2.5">{getAge(residentData.tanggalLahir)} Tahun ({getKategoriUmur(getAge(residentData.tanggalLahir))})</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 font-bold">Jenis Kelamin</td>
                    <td className="p-2.5">{residentData.jenisKelamin}</td>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-300">
                    <td className="p-2.5 font-bold">Agama</td>
                    <td className="p-2.5">{residentData.agama}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 font-bold">Status Perkawinan</td>
                    <td className="p-2.5">
                      {residentData.statusPerkawinan}
                      {residentData.tanggalPerkawinan ? ` (Tgl: ${residentData.tanggalPerkawinan})` : ''}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-300">
                    <td className="p-2.5 font-bold">Kewarganegaraan</td>
                    <td className="p-2.5">{residentData.kewarganegaraan || 'WNI'}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 font-bold">Nama Orang Tua (Ayah / Ibu)</td>
                    <td className="p-2.5">
                      Ayah: <strong>{residentData.namaAyah || '-'}</strong> | Ibu: <strong>{residentData.namaIbu || '-'}</strong>
                    </td>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-300">
                    <td className="p-2.5 font-bold">Pendidikan Terakhir</td>
                    <td className="p-2.5">{residentData.pendidikan}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 font-bold">Pekerjaan Utama</td>
                    <td className="p-2.5">{residentData.pekerjaan || '-'}</td>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-300">
                    <td className="p-2.5 font-bold">Hubungan Dalam Keluarga</td>
                    <td className="p-2.5">{residentData.hubunganKk}</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="p-2.5 font-bold">Dusun & Wilayah RT/RW</td>
                    <td className="p-2.5">{residentData.dusun} (RT {residentData.rt}/RW {residentData.rw})</td>
                  </tr>
                  <tr className="bg-slate-50 border-b border-slate-300">
                    <td className="p-2.5 font-bold">Alamat Lengkap</td>
                    <td className="p-2.5">{residentData.alamat}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">Status Penduduk</td>
                    <td className="p-2.5">{residentData.statusPenduduk}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* DOKUMEN 2: Family Card format */}
          {mode === 'family-card' && kkData && (
            <div className="space-y-4">
              <div className="text-center space-y-0.5">
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-900">
                  KARTU KELUARGA DESA
                </h2>
                <p className="text-sm font-mono font-bold text-slate-800">
                  No. {kkData.noKk}
                </p>
              </div>

              {/* Header Details */}
              <div className="grid grid-cols-2 text-xs border border-slate-300 p-3 bg-slate-50 rounded-lg">
                <div className="space-y-1">
                  <div><span className="font-semibold text-slate-600">Nama Kepala Keluarga:</span> <strong className="text-slate-900">{kkData.kepalaKeluarga}</strong></div>
                  <div><span className="font-semibold text-slate-600">Alamat:</span> {kkData.alamat}</div>
                  <div><span className="font-semibold text-slate-600">RT / RW:</span> {kkData.rt} / {kkData.rw}</div>
                </div>
                <div className="space-y-1 text-right">
                  <div><span className="font-semibold text-slate-600">Dusun:</span> {kkData.dusun}</div>
                  <div><span className="font-semibold text-slate-600">Desa/Kelurahan:</span> {villageProfile.namaDesa}</div>
                  <div><span className="font-semibold text-slate-600">Kecamatan:</span> {villageProfile.kecamatan}</div>
                </div>
              </div>

              {/* Members Table */}
              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 border-b border-slate-300 text-center font-bold">
                    <th className="p-2 border-r border-slate-300">No</th>
                    <th className="p-2 border-r border-slate-300">Nama Lengkap</th>
                    <th className="p-2 border-r border-slate-300">NIK</th>
                    <th className="p-2 border-r border-slate-300">L/P</th>
                    <th className="p-2 border-r border-slate-300">Tempat, Tgl Lahir</th>
                    <th className="p-2 border-r border-slate-300">Agama</th>
                    <th className="p-2 border-r border-slate-300">Pendidikan</th>
                    <th className="p-2 border-r border-slate-300">Pekerjaan</th>
                    <th className="p-2">Hubungan</th>
                  </tr>
                </thead>
                <tbody>
                  {kkData.anggota.map((m, idx) => (
                    <tr key={m.id} className="border-b border-slate-300 hover:bg-slate-50">
                      <td className="p-2 text-center border-r border-slate-300">{idx + 1}</td>
                      <td className="p-2 font-bold border-r border-slate-300">{m.nama}</td>
                      <td className="p-2 font-mono text-center border-r border-slate-300">{m.nik}</td>
                      <td className="p-2 text-center border-r border-slate-300">{m.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}</td>
                      <td className="p-2 border-r border-slate-300">{m.tempatLahir}, {m.tanggalLahir}</td>
                      <td className="p-2 text-center border-r border-slate-300">{m.agama}</td>
                      <td className="p-2 border-r border-slate-300">{m.pendidikan}</td>
                      <td className="p-2 border-r border-slate-300">{m.pekerjaan || '-'}</td>
                      <td className="p-2 text-center font-semibold">{m.hubunganKk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* DOKUMEN 3: Report List */}
          {mode === 'report' && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-base font-extrabold uppercase underline tracking-wider">
                  {reportTitle}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Rekapitulasi Data Terdaftar Per {currentDateFormatted}
                </p>
              </div>

              <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 border-b border-slate-300 font-bold">
                    <th className="p-1.5 border-r border-slate-300 text-center">No</th>
                    <th className="p-1.5 border-r border-slate-300">NIK</th>
                    <th className="p-1.5 border-r border-slate-300">Nama Lengkap</th>
                    <th className="p-1.5 border-r border-slate-300 text-center">L/P</th>
                    <th className="p-1.5 border-r border-slate-300 text-center">Umur</th>
                    <th className="p-1.5 border-r border-slate-300">Dusun</th>
                    <th className="p-1.5 border-r border-slate-300">RT/RW</th>
                    <th className="p-1.5 border-r border-slate-300">Pendidikan</th>
                    <th className="p-1.5">Pekerjaan</th>
                  </tr>
                </thead>
                <tbody>
                  {reportList.map((r, idx) => {
                    const age = getAge(r.tanggalLahir);
                    return (
                      <tr key={r.id} className="border-b border-slate-200">
                        <td className="p-1.5 text-center border-r border-slate-200">{idx + 1}</td>
                        <td className="p-1.5 font-mono border-r border-slate-200">{r.nik}</td>
                        <td className="p-1.5 font-bold border-r border-slate-200">{r.nama}</td>
                        <td className="p-1.5 text-center border-r border-slate-200">{r.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}</td>
                        <td className="p-1.5 text-center border-r border-slate-200">{age} th</td>
                        <td className="p-1.5 border-r border-slate-200">{r.dusun}</td>
                        <td className="p-1.5 border-r border-slate-200">RT {r.rt}/RW {r.rw}</td>
                        <td className="p-1.5 border-r border-slate-200">{r.pendidikan}</td>
                        <td className="p-1.5">{r.pekerjaan || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* DOKUMEN 4: KK Report */}
          {mode === 'kk-report' && (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-base font-extrabold uppercase underline tracking-wider">
                  REKAPITULASI KARTU KELUARGA (KK) DESA
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Daftar Kepala Keluarga & Domisili Terdaftar
                </p>
              </div>

              <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 border-b border-slate-300 font-bold">
                    <th className="p-2 border-r border-slate-300 text-center">No</th>
                    <th className="p-2 border-r border-slate-300">No. Kartu Keluarga</th>
                    <th className="p-2 border-r border-slate-300">Kepala Keluarga</th>
                    <th className="p-2 border-r border-slate-300">NIK Kepala</th>
                    <th className="p-2 border-r border-slate-300">Dusun</th>
                    <th className="p-2 border-r border-slate-300 text-center">RT/RW</th>
                    <th className="p-2 text-center">Jumlah Anggota</th>
                  </tr>
                </thead>
                <tbody>
                  {kkListReport.map((kk, idx) => (
                    <tr key={kk.noKk} className="border-b border-slate-200">
                      <td className="p-2 text-center border-r border-slate-200">{idx + 1}</td>
                      <td className="p-2 font-mono font-bold border-r border-slate-200">{kk.noKk}</td>
                      <td className="p-2 font-bold text-emerald-900 border-r border-slate-200">{kk.kepalaKeluarga}</td>
                      <td className="p-2 font-mono border-r border-slate-200">{kk.nikKepala}</td>
                      <td className="p-2 border-r border-slate-200">{kk.dusun}</td>
                      <td className="p-2 text-center border-r border-slate-200">{kk.rt}/{kk.rw}</td>
                      <td className="p-2 text-center font-bold border-slate-200">{kk.jumlahAnggota} Orang</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* OFFICIAL SIGNATURE BLOCK */}
          <div className="mt-12 pt-6 flex justify-between items-end text-xs break-inside-avoid">
            <div className="text-center space-y-1">
              <p>Mengetahui,</p>
              <p className="font-semibold">Kepala Urusan Pemerintahan</p>
              <div className="h-16" />
              <p className="font-bold underline">SIPENDUK DESA WAIHATU</p>
            </div>

            <div className="text-center space-y-1">
              <p>Waihatu, {currentDateFormatted}</p>
              <p className="font-semibold">Kepala Desa {villageProfile.namaDesa}</p>
              <div className="h-16" />
              <p className="font-extrabold underline uppercase">{villageProfile.namaKepalaDesa}</p>
              {villageProfile.nipKepalaDesa && (
                <p className="font-mono text-[10px] text-slate-600">NIP. {villageProfile.nipKepalaDesa}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
