'use client';

import React, { useState } from 'react';
import { useResidents } from '@/context/ResidentContext';
import { DEFAULT_LOGO_KABUPATEN_SVG, DEFAULT_LOGO_DESA_SVG } from '@/lib/seed-data';
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  FileSpreadsheet, 
  ArrowUpDown, 
  Settings, 
  Search, 
  Menu, 
  X, 
  Building2, 
  Plus, 
  Database,
  Printer,
  Share2,
  ShieldCheck,
  LogOut,
  Lock,
  Cloud
} from 'lucide-react';

interface HeaderSidebarProps {
  onOpenAddModal: () => void;
  onOpenShareModal: () => void;
}

export function HeaderSidebar({ onOpenAddModal, onOpenShareModal }: HeaderSidebarProps) {
  const { 
    activeTab, 
    setActiveTab, 
    searchQuery, 
    setSearchQuery, 
    villageProfile,
    stats,
    isAdminLoggedIn,
    adminCredentials,
    logoutAdmin,
    setIsAuthModalOpen,
    requireAdmin,
    isCloudSynced,
    cloudStatusText
  } = useResidents();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'penduduk', label: 'Data Penduduk', icon: Users, badge: stats.totalPenduduk },
    { id: 'kk', label: 'Kartu Keluarga', icon: Home, badge: stats.jumlahKk },
    { id: 'laporan', label: 'Laporan & Cetak', icon: FileSpreadsheet },
    { id: 'import-export', label: 'Import / Export', icon: ArrowUpDown },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings }
  ];

  return (
    <>
      {/* Top Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-emerald-800 text-white shadow-md flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 transition"
            aria-label="Toggle menu"
            id="mobile-menu-toggle-btn"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="flex items-center space-x-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={villageProfile.logoKabupatenUrl || DEFAULT_LOGO_KABUPATEN_SVG} 
              alt="Logo Kabupaten" 
              className="w-7 h-8 object-contain shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_KABUPATEN_SVG;
              }}
            />
            <div>
              <h1 className="font-bold text-sm tracking-wide leading-tight">SIPENDUK</h1>
              <p className="text-xs text-emerald-200">Desa {villageProfile.namaDesa}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isAdminLoggedIn ? (
            <button
              onClick={logoutAdmin}
              className="flex items-center space-x-1 text-xs bg-rose-600/90 hover:bg-rose-600 text-white font-semibold px-2.5 py-1.5 rounded-lg transition shadow-xs"
              title="Keluar dari mode Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center space-x-1 text-xs bg-emerald-700 hover:bg-emerald-600 text-white font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-500/50 shadow-xs transition"
              title="Login Admin untuk Edit/Input Data"
            >
              <Lock className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Login Admin</span>
            </button>
          )}

          <button
            onClick={onOpenShareModal}
            className="flex items-center space-x-1 text-xs bg-emerald-700 hover:bg-emerald-600 text-emerald-100 font-medium px-2.5 py-1.5 rounded-lg border border-emerald-600 shadow-xs transition"
            id="mobile-share-link-btn"
            title="Perpendek & Bagikan Link Akses Web"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-300" />
            <span className="hidden sm:inline">Perpendek Link</span>
          </button>
          <button
            onClick={() => requireAdmin(onOpenAddModal)}
            className="flex items-center space-x-1 text-xs bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-3 py-1.5 rounded-lg shadow transition"
            id="mobile-add-resident-btn"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 text-slate-200 shadow-xl flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:static lg:z-auto`}
        id="main-sidebar"
      >
        <div>
          {/* Sidebar Header */}
          <div className="p-4 bg-emerald-950/80 border-b border-emerald-800/50 flex items-center space-x-3">
            <div className="flex items-center space-x-1 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={villageProfile.logoKabupatenUrl || DEFAULT_LOGO_KABUPATEN_SVG} 
                alt="Logo Kabupaten" 
                className="w-8 h-10 object-contain drop-shadow"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_KABUPATEN_SVG;
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={villageProfile.logoUrl || DEFAULT_LOGO_DESA_SVG} 
                alt="Logo Desa" 
                className="w-7 h-9 object-contain drop-shadow"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = DEFAULT_LOGO_DESA_SVG;
                }}
              />
            </div>
            <div>
              <h2 className="font-bold text-base text-white tracking-wide">SIPENDUK</h2>
              <p className="text-xs text-emerald-300 font-medium">Desa {villageProfile.namaDesa}</p>
              <p className="text-[10px] text-slate-400 truncate max-w-[110px]">Kab. {villageProfile.kabupaten}</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="p-4 border-b border-slate-800">
            <button
              onClick={() => {
                requireAdmin(() => {
                  onOpenAddModal();
                  setMobileMenuOpen(false);
                });
              }}
              className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-xl shadow-md hover:shadow-emerald-600/30 transition text-sm"
              id="sidebar-add-resident-btn"
            >
              <Plus className="w-4 h-4" />
              <span>+ Penduduk Baru</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="px-4 py-3 border-b border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari NIK / Nama / KK..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                id="sidebar-search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1">
            <p className="px-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Menu Utama
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-md' 
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                  id={`nav-item-${item.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-emerald-800 text-white font-bold' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400 space-y-3">
          {/* Admin Status Box */}
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
            {isAdminLoggedIn ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Admin: {adminCredentials.username}</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <button
                  onClick={logoutAdmin}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-rose-900/40 hover:bg-rose-900/70 border border-rose-700/50 text-rose-300 font-bold text-[10px] rounded-lg transition"
                  id="sidebar-logout-btn"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Keluar Admin</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-amber-400 font-bold text-[11px] flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Mode Lihat (Publik)</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-emerald-900/50 hover:bg-emerald-800/80 border border-emerald-700/60 text-emerald-300 font-bold text-[11px] rounded-lg transition"
                  id="sidebar-login-btn"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Login Admin</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              onOpenShareModal();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 font-semibold py-2 px-3 rounded-xl border border-emerald-800/60 shadow-xs transition text-xs"
            id="sidebar-share-link-btn"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Perpendek & Bagikan Link</span>
          </button>

          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-slate-300">Kab. {villageProfile.kabupaten}</span>
            </div>
            <p className="text-[11px] text-slate-400">Kec. {villageProfile.kecamatan} • Kode Pos {villageProfile.kodePos}</p>
            <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]" title={cloudStatusText}>
              <span className="flex items-center space-x-1.5 font-medium text-emerald-400">
                <Cloud className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>{isCloudSynced ? 'Database Real-Time' : 'Offline Mode'}</span>
              </span>
              <span className="text-slate-400">Thn {villageProfile.tahunPendataan}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
