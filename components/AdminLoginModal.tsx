'use client';

import React, { useState } from 'react';
import { useResidents } from '@/context/ResidentContext';
import { ShieldCheck, Lock, User, Eye, EyeOff, X, AlertCircle, KeyRound } from 'lucide-react';

export function AdminLoginModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, loginAdmin } = useResidents();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setErrorMsg('Mohon isi Username dan Password.');
      return;
    }

    const success = loginAdmin(username, password);
    if (success) {
      setErrorMsg('');
      setUsername('');
      setPassword('');
    } else {
      setErrorMsg('Username atau Password salah! Periksa kembali data Anda.');
    }
  };

  const handleClose = () => {
    setErrorMsg('');
    setIsAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative transform transition-all space-y-5"
        id="admin-login-modal"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition"
          id="close-login-modal-btn"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 leading-snug">Autentikasi Administrator</h3>
            <p className="text-xs text-slate-500">Masukkan Username & Password untuk mengedit atau menambah data</p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Default Credential Hint Box */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 flex items-start space-x-2.5 text-xs text-amber-900">
          <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold">Kredensial Default Sistem:</span>
            <div className="mt-0.5 font-mono text-[11px] bg-white/80 px-2 py-0.5 rounded border border-amber-200 inline-block">
              Username: <strong className="text-emerald-700">admin</strong> | Password: <strong className="text-emerald-700">admin</strong>
            </div>
            <p className="text-[10px] text-amber-700 mt-1">
              (Dapat Anda perbarui kapan saja melalui menu <strong>Pengaturan</strong>)
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Username Admin</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                id="admin-username-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Password Admin</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition"
                id="admin-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              id="cancel-login-btn"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md hover:shadow-lg flex items-center space-x-2"
              id="submit-login-btn"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Masuk Administrator</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
