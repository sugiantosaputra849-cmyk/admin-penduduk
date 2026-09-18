'use client';

import React, { useState } from 'react';
import { useResidents } from '@/context/ResidentContext';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  KeyRound,
  Building2,
  CheckCircle2
} from 'lucide-react';

export function AppLockGate() {
  const { villageProfile, isAdminLoggedIn, loginAdmin } = useResidents();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (isAdminLoggedIn) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Mohon isi Username dan Password terlebih dahulu.');
      return;
    }

    const success = loginAdmin(username, password);
    if (success) {
      setErrorMsg('');
      setUsername('');
      setPassword('');
    } else {
      setErrorMsg('Username atau Password tidak valid! Periksa kembali kredensial Anda.');
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md space-y-6 my-auto">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-3">
            {villageProfile.logoKabupatenUrl ? (
              <img 
                src={villageProfile.logoKabupatenUrl} 
                alt="Logo SBB" 
                className="w-12 h-14 object-contain drop-shadow-md"
              />
            ) : (
              <Building2 className="w-10 h-10 text-emerald-400" />
            )}
            {villageProfile.logoUrl && (
              <img 
                src={villageProfile.logoUrl} 
                alt="Logo Desa Waihatu" 
                className="w-12 h-14 object-contain drop-shadow-md"
              />
            )}
          </div>

          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 text-xs font-semibold mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Aplikasi Terkunci — Sistem Terproteksi</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              SIPENDUK DESA WAIHATU
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {villageProfile.namaDesa}, {villageProfile.kecamatan}, {villageProfile.kabupaten}
            </p>
          </div>
        </div>

        {/* Lock Form Card */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="text-center pb-2 border-b border-slate-800">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">Login Autentikasi Sistem</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Masukkan username dan password untuk membuka akses aplikasi
            </p>
          </div>

          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Default Credential Notice Box */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3.5 text-xs text-amber-200/90 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold text-amber-300 text-[11px]">
              <KeyRound className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Kredensial Default Login Bawaan:</span>
            </div>
            <div className="font-mono text-[11px] bg-slate-950/80 px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-100 flex items-center justify-between">
              <span>Username: <strong className="text-emerald-400">admin</strong></span>
              <span className="text-slate-500">|</span>
              <span>Password: <strong className="text-emerald-400">admin</strong></span>
            </div>
            <p className="text-[10px] text-amber-300/70 pt-0.5">
              *Password dapat diubah kapan saja di menu <strong>Pengaturan</strong> setelah masuk.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-white text-xs font-semibold outline-none transition placeholder:text-slate-500"
                  id="lockgate-username-input"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-white text-xs font-semibold outline-none transition placeholder:text-slate-500"
                  id="lockgate-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl transition shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2"
              id="lockgate-submit-btn"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Buka Kunci & Masuk Aplikasi</span>
            </button>
          </form>
        </div>

        {/* Footer Credit */}
        <p className="text-center text-[11px] text-slate-500 font-medium">
          © {new Date().getFullYear()} {villageProfile.namaDesa} — {villageProfile.kabupaten}.
        </p>
      </div>
    </div>
  );
}
