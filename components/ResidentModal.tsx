'use client';

import React, { useState, useEffect } from 'react';
import { useResidents } from '@/context/ResidentContext';
import { 
  Resident, 
  JenisKelamin, 
  Agama, 
  StatusPerkawinan, 
  Kewarganegaraan,
  Pendidikan, 
  HubunganKk, 
  StatusPenduduk,
  getAge,
  getKategoriUmur
} from '@/types/resident';
import { X, Save, User, FileText, MapPin, Phone, Calculator } from 'lucide-react';

interface ResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Resident | null;
  defaultNoKk?: string;
  defaultDusun?: string;
  defaultAlamat?: string;
  defaultRt?: string;
  defaultRw?: string;
}

export function ResidentModal({
  isOpen,
  onClose,
  initialData,
  defaultNoKk = '',
  defaultDusun = 'Dusun Waihatu',
  defaultAlamat = '',
  defaultRt = '001',
  defaultRw = '001'
}: ResidentModalProps) {
  const { addResident, updateResident } = useResidents();
  const [activeTab, setActiveTab] = useState<'identitas' | 'demografi' | 'alamat'>('identitas');

  // Form State initialized directly from props
  const [nik, setNik] = useState(initialData?.nik || '');
  const [noKk, setNoKk] = useState(initialData?.noKk || defaultNoKk);
  const [nama, setNama] = useState(initialData?.nama || '');
  const [tempatLahir, setTempatLahir] = useState(initialData?.tempatLahir || 'Waihatu');
  const [tanggalLahir, setTanggalLahir] = useState(initialData?.tanggalLahir || '1995-01-01');
  const [jenisKelamin, setJenisKelamin] = useState<JenisKelamin>(initialData?.jenisKelamin || 'Laki-laki');
  const [agama, setAgama] = useState<Agama>(initialData?.agama || 'Kristen Protestan');
  const [statusPerkawinan, setStatusPerkawinan] = useState<StatusPerkawinan>(initialData?.statusPerkawinan || 'Belum Menikah');
  const [tanggalPerkawinan, setTanggalPerkawinan] = useState(initialData?.tanggalPerkawinan || '');
  const [kewarganegaraan, setKewarganegaraan] = useState<Kewarganegaraan>(initialData?.kewarganegaraan || 'WNI');
  const [namaAyah, setNamaAyah] = useState(initialData?.namaAyah || '');
  const [namaIbu, setNamaIbu] = useState(initialData?.namaIbu || '');
  const [pendidikan, setPendidikan] = useState<Pendidikan>(initialData?.pendidikan || 'SMA/SMK');
  const [pekerjaan, setPekerjaan] = useState(initialData?.pekerjaan || 'Petani / Pekebun');
  const [hubunganKk, setHubunganKk] = useState<HubunganKk>(initialData?.hubunganKk || 'Kepala Keluarga');
  const [alamat, setAlamat] = useState(initialData?.alamat || defaultAlamat || 'Jl. Trans Seram - Waihatu');
  const [dusun, setDusun] = useState(initialData?.dusun || defaultDusun || 'Dusun Waihatu');
  const [rt, setRt] = useState(initialData?.rt || defaultRt || '001');
  const [rw, setRw] = useState(initialData?.rw || defaultRw || '001');
  const [statusPenduduk, setStatusPenduduk] = useState<StatusPenduduk>(initialData?.statusPenduduk || 'Tetap');
  const [noHp, setNoHp] = useState(initialData?.noHp || '');

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  // Age calculation preview
  const currentAge = getAge(tanggalLahir);
  const currentKategori = getKategoriUmur(currentAge);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!nik || nik.length < 16) errs.nik = 'NIK harus 16 digit angka';
    if (!noKk || noKk.length < 16) errs.noKk = 'No. KK harus 16 digit angka';
    if (!nama.trim()) errs.nama = 'Nama lengkap wajib diisi';
    if (!tempatLahir.trim()) errs.tempatLahir = 'Tempat lahir wajib diisi';
    if (!tanggalLahir) errs.tanggalLahir = 'Tanggal lahir wajib diisi';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      nik,
      noKk,
      nama,
      tempatLahir,
      tanggalLahir,
      jenisKelamin,
      agama,
      statusPerkawinan,
      tanggalPerkawinan: statusPerkawinan !== 'Belum Menikah' ? tanggalPerkawinan : '',
      kewarganegaraan,
      namaAyah: namaAyah.trim() || '-',
      namaIbu: namaIbu.trim() || '-',
      pendidikan,
      pekerjaan,
      hubunganKk,
      alamat,
      dusun,
      rt,
      rw,
      statusPenduduk,
      noHp: noHp || '-'
    };

    if (initialData) {
      updateResident(initialData.id, payload);
    } else {
      addResident(payload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-emerald-800 text-white p-4 px-6 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base tracking-wide">
              {initialData ? 'Edit Data Penduduk' : 'Tambah Penduduk Baru'}
            </h3>
            <p className="text-xs text-emerald-200">SIPENDUK Desa Waihatu</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-700 text-emerald-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Category Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveTab('identitas')}
            className={`flex-1 py-2.5 px-4 text-center border-b-2 transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'identitas'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Identitas Diri</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('demografi')}
            className={`flex-1 py-2.5 px-4 text-center border-b-2 transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'demografi'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Demografi & KK</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alamat')}
            className={`flex-1 py-2.5 px-4 text-center border-b-2 transition flex items-center justify-center space-x-1.5 ${
              activeTab === 'alamat'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>3. Alamat & Kontak</span>
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* TAB 1: Identitas */}
          {activeTab === 'identitas' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIK (Nomor Induk Kependudukan) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 Digit NIK..."
                    value={nik}
                    onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                    className={`w-full p-2.5 bg-slate-50 border ${errors.nik ? 'border-rose-500' : 'border-slate-300'} rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                    id="form-nik"
                  />
                  {errors.nik && <p className="text-rose-500 text-[10px] mt-1">{errors.nik}</p>}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. Kartu Keluarga (KK) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="16 Digit No. KK..."
                    value={noKk}
                    onChange={(e) => setNoKk(e.target.value.replace(/\D/g, ''))}
                    className={`w-full p-2.5 bg-slate-50 border ${errors.noKk ? 'border-rose-500' : 'border-slate-300'} rounded-xl font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                    id="form-nokk"
                  />
                  {errors.noKk && <p className="text-rose-500 text-[10px] mt-1">{errors.noKk}</p>}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nama sesuai KTP/Akte..."
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className={`w-full p-2.5 bg-slate-50 border ${errors.nama ? 'border-rose-500' : 'border-slate-300'} rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                  id="form-nama"
                />
                {errors.nama && <p className="text-rose-500 text-[10px] mt-1">{errors.nama}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    placeholder="Waihatu / Ambon..."
                    value={tempatLahir}
                    onChange={(e) => setTempatLahir(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="form-tempat-lahir"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="form-tanggal-lahir"
                  />
                </div>
              </div>

              {/* Calculated Age Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-emerald-600" />
                  <span>Hasil Otomatis Umur:</span>
                  <strong className="text-base font-bold text-slate-900">{currentAge} Tahun</strong>
                </div>
                <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-700 text-white text-[10px]">
                  Kategori: {currentKategori}
                </span>
              </div>

              {/* Kewarganegaraan & Orang Tua */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kewarganegaraan</label>
                    <select
                      value={kewarganegaraan}
                      onChange={(e) => setKewarganegaraan(e.target.value as Kewarganegaraan)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                      id="form-kewarganegaraan"
                    >
                      <option value="WNI">WNI (Indonesia)</option>
                      <option value="WNA">WNA (Asing)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Ayah Kandung</label>
                    <input
                      type="text"
                      placeholder="Nama lengkap Ayah..."
                      value={namaAyah}
                      onChange={(e) => setNamaAyah(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      id="form-nama-ayah"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Ibu Kandung</label>
                    <input
                      type="text"
                      placeholder="Nama lengkap Ibu..."
                      value={namaIbu}
                      onChange={(e) => setNamaIbu(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      id="form-nama-ibu"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Demografi & KK */}
          {activeTab === 'demografi' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={jenisKelamin}
                    onChange={(e) => setJenisKelamin(e.target.value as JenisKelamin)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="form-jenis-kelamin"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Agama</label>
                  <select
                    value={agama}
                    onChange={(e) => setAgama(e.target.value as Agama)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="form-agama"
                  >
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Islam">Islam</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Khonghucu">Khonghucu</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Perkawinan</label>
                  <select
                    value={statusPerkawinan}
                    onChange={(e) => setStatusPerkawinan(e.target.value as StatusPerkawinan)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                    id="form-status-kawin"
                  >
                    <option value="Belum Menikah">Belum Menikah</option>
                    <option value="Menikah">Menikah</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Perkawinan / Perceraian
                    {statusPerkawinan === 'Belum Menikah' && <span className="text-[10px] text-slate-400 font-normal ml-1">(Opsional)</span>}
                  </label>
                  <input
                    type="date"
                    disabled={statusPerkawinan === 'Belum Menikah'}
                    value={tanggalPerkawinan}
                    onChange={(e) => setTanggalPerkawinan(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:bg-slate-100"
                    id="form-tanggal-perkawinan"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hubungan Dalam KK</label>
                  <select
                    value={hubunganKk}
                    onChange={(e) => setHubunganKk(e.target.value as HubunganKk)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="form-hubungan-kk"
                  >
                    <option value="Kepala Keluarga">Kepala Keluarga</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Cucu">Cucu</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Mertua">Mertua</option>
                    <option value="Famili Lain">Famili Lain</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tingkat Pendidikan</label>
                  <select
                    value={pendidikan}
                    onChange={(e) => setPendidikan(e.target.value as Pendidikan)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="form-pendidikan"
                  >
                    <option value="Tidak/Belum Sekolah">Tidak/Belum Sekolah</option>
                    <option value="SD">SD</option>
                    <option value="SMP">SMP</option>
                    <option value="SMA/SMK">SMA/SMK</option>
                    <option value="D3">D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    placeholder="Petani, Nelayan, PNS, Wiraswasta..."
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="form-pekerjaan"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Alamat & Kontak */}
          {activeTab === 'alamat' && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilih Dusun</label>
                <select
                  value={dusun}
                  onChange={(e) => setDusun(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  id="form-dusun"
                >
                  <option value="Dusun Waihatu">Dusun Waihatu</option>
                  <option value="Dusun Sukamaju">Dusun Sukamaju</option>
                  <option value="Dusun Sukamulia">Dusun Sukamulia</option>
                  <option value="Dusun Samasuru">Dusun Samasuru</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">RT</label>
                  <input
                    type="text"
                    value={rt}
                    onChange={(e) => setRt(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="form-rt"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">RW</label>
                  <input
                    type="text"
                    value={rw}
                    onChange={(e) => setRw(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="form-rw"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Jalan / Bangunan</label>
                <textarea
                  rows={2}
                  placeholder="Jl. Melati RT 002/RW 001..."
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  id="form-alamat"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Keberadaan Penduduk</label>
                  <select
                    value={statusPenduduk}
                    onChange={(e) => setStatusPenduduk(e.target.value as StatusPenduduk)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="form-status-penduduk"
                  >
                    <option value="Tetap">Tetap</option>
                    <option value="Kontrak/Sewa">Kontrak/Sewa</option>
                    <option value="Pendatang">Pendatang</option>
                    <option value="Pindah">Pindah</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Handphone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="form-nohp"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div className="flex space-x-2">
              {activeTab !== 'identitas' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'alamat' ? 'demografi' : 'identitas')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
                >
                  Sebelumnya
                </button>
              )}
              {activeTab !== 'alamat' && (
                <button
                  type="button"
                  onClick={() => setActiveTab(activeTab === 'identitas' ? 'demografi' : 'alamat')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs transition"
                >
                  Lanjut
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md transition flex items-center space-x-1.5"
                id="submit-resident-btn"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Data</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
