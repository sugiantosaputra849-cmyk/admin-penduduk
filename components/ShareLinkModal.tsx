'use client';

import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, Share2, Smartphone, Monitor, Globe, QrCode } from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareLinkModal({ isOpen, onClose }: ShareLinkModalProps) {
  const [copied, setCopied] = useState(false);
  const [appUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin || window.location.href;
    }
    return '';
  });

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!appUrl) return;
    navigator.clipboard.writeText(appUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      // Fallback manual prompt if clipboard API blocked
      prompt('Salin link aplikasi SIPENDUK berikut:', appUrl);
    });
  };

  const handleOpenNewTab = () => {
    if (appUrl) {
      window.open(appUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Generate SVG QR Code URL using public QR code API
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appUrl || 'https://ais-pre-lixgqodezr5ou5mmdxc2yl-240607767398.asia-southeast1.run.app')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 p-5 text-white flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Share2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Link Akses Aplikasi Online</h3>
              <p className="text-xs text-emerald-200 mt-0.5">SIPENDUK Desa Waihatu dapat dibuka di mana saja</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
            id="close-share-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Main Link Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Link Web Resmi SIPENDUK:
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-emerald-950 truncate select-all font-semibold">
                {appUrl || 'https://ais-pre-lixgqodezr5ou5mmdxc2yl-240607767398.asia-southeast1.run.app'}
              </div>
              <button
                onClick={handleCopy}
                className={`flex items-center space-x-1.5 px-4 py-3 rounded-xl font-bold text-xs shadow-sm transition shrink-0 ${
                  copied 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
                id="copy-app-link-btn"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
              </button>
            </div>
            {copied && (
              <p className="text-xs font-medium text-emerald-600 flex items-center space-x-1 animate-pulse">
                <Check className="w-3.5 h-3.5" />
                <span>Link berhasil disalin! Anda bisa membagikannya ke WhatsApp atau media sosial.</span>
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleOpenNewTab}
              className="flex items-center justify-center space-x-2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition border border-slate-200"
              id="open-new-tab-btn"
            >
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              <span>Buka di Tab Baru</span>
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center space-x-2 p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold rounded-xl text-xs transition border border-emerald-200"
              id="share-whatsapp-btn"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Salin untuk WhatsApp</span>
            </button>
          </div>

          {/* QR Code Section */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={qrCodeImageUrl} 
                alt="QR Code Aplikasi SIPENDUK" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback icon if offline
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-slate-800 font-bold text-xs">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Pindai Kamera HP / Tablet</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Scan QR Code ini menggunakan kamera Smartphone atau Tablet untuk langsung membuka aplikasi SIPENDUK Desa Waihatu tanpa perlu mengetik alamat URL.
              </p>
            </div>
          </div>

          {/* Devices Grid */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Dapat Diakses Di Berbagai Perangkat:</span>
            </p>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-600 font-medium">
              <div className="p-2 bg-slate-100/70 rounded-lg flex flex-col items-center">
                <Smartphone className="w-4 h-4 text-slate-700 mb-1" />
                <span>Smartphone Android / iPhone</span>
              </div>
              <div className="p-2 bg-slate-100/70 rounded-lg flex flex-col items-center">
                <Monitor className="w-4 h-4 text-slate-700 mb-1" />
                <span>Laptop & Komputer PC</span>
              </div>
              <div className="p-2 bg-slate-100/70 rounded-lg flex flex-col items-center">
                <Globe className="w-4 h-4 text-slate-700 mb-1" />
                <span>Tablet & iPad</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
