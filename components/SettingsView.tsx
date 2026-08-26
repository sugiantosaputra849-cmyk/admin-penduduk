'use client';

import React, { useState } from 'react';
import { useResidents } from '@/context/ResidentContext';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Building2, 
  ShieldCheck, 
  CheckCircle, 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  RefreshCw 
} from 'lucide-react';
import { DEFAULT_LOGO_KABUPATEN_SVG, DEFAULT_LOGO_DESA_SVG } from '@/lib/seed-data';

export function SettingsView() {
  const { villageProfile, updateVillageProfile, resetDatabase } = useResidents();

  const [formProfile, setFormProfile] = useState({ ...villageProfile });
  const [adminUsername, setAdminUsername] = useState('admin_waihatu');
  const [adminPassword, setAdminPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldKey: 'logoKabupatenUrl' | 'logoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran berkas logo terlalu besar. Maksimal 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormProfile((prev) => ({ ...prev, [fieldKey]: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateVillageProfile(formProfile);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6" id="settings-container">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <span>Pengaturan Sistem & Profil Desa</span>
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Kelola informasi resmi Pemerintah Desa Waihatu, identitas Kepala Desa, dan konfigurasi akun admin.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>Profil Desa Waihatu berhasil diperbarui!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Village Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">Identitas Pemerintah Desa</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Desa</label>
                <input
                  type="text"
                  value={formProfile.namaDesa}
                  onChange={(e) => setFormProfile({ ...formProfile, namaDesa: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                  id="setting-nama-desa"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kecamatan</label>
                <input
                  type="text"
                  value={formProfile.kecamatan}
                  onChange={(e) => setFormProfile({ ...formProfile, kecamatan: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                  id="setting-kecamatan"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kabupaten</label>
                <input
                  type="text"
                  value={formProfile.kabupaten}
                  onChange={(e) => setFormProfile({ ...formProfile, kabupaten: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                  id="setting-kabupaten"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provinsi</label>
                <input
                  type="text"
                  value={formProfile.provinsi}
                  onChange={(e) => setFormProfile({ ...formProfile, provinsi: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                  id="setting-provinsi"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Pos</label>
                <input
                  type="text"
                  value={formProfile.kodePos}
                  onChange={(e) => setFormProfile({ ...formProfile, kodePos: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  id="setting-kodepos"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tahun Pendataan</label>
                <input
                  type="number"
                  value={formProfile.tahunPendataan}
                  onChange={(e) => setFormProfile({ ...formProfile, tahunPendataan: parseInt(e.target.value) || 2026 })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  id="setting-tahun"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-800 text-xs mb-3">Pejabat Kepala Desa (Penandatangan Dokumen Official)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Kepala Desa / Penjabat</label>
                  <input
                    type="text"
                    value={formProfile.namaKepalaDesa}
                    onChange={(e) => setFormProfile({ ...formProfile, namaKepalaDesa: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    required
                    id="setting-kepala-desa"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP Kepala Desa</label>
                  <input
                    type="text"
                    value={formProfile.nipKepalaDesa}
                    onChange={(e) => setFormProfile({ ...formProfile, nipKepalaDesa: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    id="setting-nip"
                  />
                </div>
              </div>
            </div>

            {/* Logo Resmi & Lambang (Kop Surat & Identitas Cetak) */}
            <div className="pt-3 border-t border-slate-100 space-y-4">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-slate-800 text-xs">Logo Resmi & Lambang (Kop Surat & Cetak Dokumen)</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Logo Kabupaten */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                      <span>Logo / Lambang Kabupaten</span>
                      <span className="text-[10px] text-emerald-700 font-normal bg-emerald-100 px-1.5 py-0.5 rounded-full">Kop Kiri</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-20 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1.5 shadow-xs shrink-0 overflow-hidden">
                      {formProfile.logoKabupatenUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={formProfile.logoKabupatenUrl} 
                          alt="Logo Kabupaten" 
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[9px] text-slate-400 text-center font-semibold">Kosong</span>
                      )}
                    </div>

                    <div className="space-y-2 text-[11px] flex-1">
                      <label className="cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Logo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'logoKabupatenUrl')}
                          id="upload-logo-kabupaten"
                        />
                      </label>

                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={() => setFormProfile((prev) => ({ ...prev, logoKabupatenUrl: DEFAULT_LOGO_KABUPATEN_SVG }))}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-semibold text-[10px] flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Preset Default</span>
                        </button>
                        {formProfile.logoKabupatenUrl && (
                          <button
                            type="button"
                            onClick={() => setFormProfile((prev) => ({ ...prev, logoKabupatenUrl: '' }))}
                            className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-md font-semibold text-[10px] flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">Atau masukkan URL Gambar:</span>
                    <input 
                      type="text"
                      placeholder="https://..."
                      value={formProfile.logoKabupatenUrl || ''}
                      onChange={(e) => setFormProfile({ ...formProfile, logoKabupatenUrl: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-mono text-slate-700"
                      id="url-logo-kabupaten"
                    />
                  </div>
                </div>

                {/* Logo Desa */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-800 text-xs flex items-center space-x-1.5">
                      <span>Logo / Lambang Desa</span>
                      <span className="text-[10px] text-blue-700 font-normal bg-blue-100 px-1.5 py-0.5 rounded-full">Kop Kanan</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-16 h-20 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1.5 shadow-xs shrink-0 overflow-hidden">
                      {formProfile.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img 
                          src={formProfile.logoUrl} 
                          alt="Logo Desa" 
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="text-[9px] text-slate-400 text-center font-semibold">Kosong</span>
                      )}
                    </div>

                    <div className="space-y-2 text-[11px] flex-1">
                      <label className="cursor-pointer inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Logo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, 'logoUrl')}
                          id="upload-logo-desa"
                        />
                      </label>

                      <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={() => setFormProfile((prev) => ({ ...prev, logoUrl: DEFAULT_LOGO_DESA_SVG }))}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-semibold text-[10px] flex items-center space-x-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Preset Default</span>
                        </button>
                        {formProfile.logoUrl && (
                          <button
                            type="button"
                            onClick={() => setFormProfile((prev) => ({ ...prev, logoUrl: '' }))}
                            className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-md font-semibold text-[10px] flex items-center space-x-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 block mb-1">Atau masukkan URL Gambar:</span>
                    <input 
                      type="text"
                      placeholder="https://..."
                      value={formProfile.logoUrl || ''}
                      onChange={(e) => setFormProfile({ ...formProfile, logoUrl: e.target.value })}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-mono text-slate-700"
                      id="url-logo-desa"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alamat Kantor Desa</label>
              <textarea
                rows={2}
                value={formProfile.alamatKantor}
                onChange={(e) => setFormProfile({ ...formProfile, alamatKantor: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                id="setting-alamat-kantor"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
                id="save-settings-btn"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Admin Account & Database Operations */}
        <div className="space-y-6">
          {/* Admin Credentials */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Akun Administrator</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Username Admin</label>
                <input
                  type="text"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ubah Password</label>
                <input
                  type="password"
                  placeholder="Password Baru..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-1">
                <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-md font-semibold text-[10px]">
                  Hak Akses: Administrator Utama Desa
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone / Reset */}
          <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-rose-800 text-sm flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reset Database Default</span>
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Kembalikan seluruh data penduduk dan profil desa ke data contoh awal (Seed Data Desa Waihatu).
            </p>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-xl transition"
              id="reset-db-btn"
            >
              Reset ke Data Default
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Konfirmasi Reset Database</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda benar-benar ingin mereset seluruh data kembali ke data contoh awal Desa Waihatu? Semua data baru yang Anda input akan digantikan.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  resetDatabase();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow transition"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
