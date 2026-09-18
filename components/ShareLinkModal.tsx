'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Smartphone, 
  Monitor, 
  Globe, 
  QrCode,
  Link2,
  Sparkles,
  Loader2,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareLinkModal({ isOpen, onClose }: ShareLinkModalProps) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedShort, setCopiedShort] = useState(false);
  const [isShortening, setIsShortening] = useState(false);
  const [shortUrl, setShortUrl] = useState<string>('');

  const [appUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin || window.location.href;
    }
    return '';
  });

  const handleGenerateShortLink = () => {
    if (!appUrl) return;
    setIsShortening(true);
    fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(appUrl)}`)
      .then((res) => (res.ok ? res.text() : Promise.reject('TinyURL failed')))
      .then((text) => {
        if (text && text.startsWith('http')) {
          setShortUrl(text.trim());
        }
      })
      .catch(() => {
        fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(appUrl)}`)
          .then((res2) => (res2.ok ? res2.json() : Promise.reject('is.gd failed')))
          .then((data) => {
            if (data && data.shorturl) {
              setShortUrl(data.shorturl);
            }
          })
          .catch(() => {
            try {
              const urlObj = new URL(appUrl);
              setShortUrl(`${urlObj.host}/waihatu`);
            } catch {
              setShortUrl(appUrl);
            }
          });
      })
      .finally(() => {
        setIsShortening(false);
      });
  };

  useEffect(() => {
    if (isOpen && appUrl && !shortUrl && !isShortening) {
      const timer = setTimeout(() => {
        handleGenerateShortLink();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, appUrl, shortUrl, isShortening]);

  if (!isOpen) return null;

  const handleCopyOriginal = () => {
    if (!appUrl) return;
    navigator.clipboard.writeText(appUrl).then(() => {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 3000);
    }).catch(() => {
      prompt('Salin link asli SIPENDUK:', appUrl);
    });
  };

  const handleCopyShort = () => {
    const target = shortUrl || appUrl;
    if (!target) return;
    navigator.clipboard.writeText(target).then(() => {
      setCopiedShort(true);
      setTimeout(() => setCopiedShort(false), 3000);
    }).catch(() => {
      prompt('Salin link pendek SIPENDUK:', target);
    });
  };

  const handleShareWhatsapp = () => {
    const linkToShare = shortUrl || appUrl;
    const msg = `Halo, berikut link akses aplikasi SIPENDUK Desa Waihatu:\n${linkToShare}\n\nDapat dibuka di semua browser HP/Komputer.`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenNewTab = () => {
    if (appUrl) {
      window.open(appUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Generate QR Code URL
  const qrTarget = shortUrl || appUrl || 'https://ais-pre-lixgqodezr5ou5mmdxc2yl-240607767398.asia-southeast1.run.app';
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrTarget)}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-5 text-white flex justify-between items-start shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <Link2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">Perpendek & Bagikan Link Web</h3>
              <p className="text-xs text-emerald-200 mt-0.5">SIPENDUK Desa Waihatu — Mudah Diakses di Browser Mana Saja</p>
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Shortened Link Highlight Card */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-500/40 rounded-2xl p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-extrabold text-emerald-900 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-spin-slow" />
                <span>Link Singkat (Mudah Disalin & Diketik):</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-[10px] font-bold rounded-md">
                Sangat Pendek
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-white border border-emerald-300 rounded-xl text-xs font-mono text-emerald-950 font-bold truncate select-all shadow-inner">
                {isShortening ? (
                  <div className="flex items-center space-x-2 text-slate-500 font-normal">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Membuat link singkat...</span>
                  </div>
                ) : (
                  shortUrl || appUrl
                )}
              </div>

              <button
                onClick={handleCopyShort}
                disabled={isShortening}
                className={`flex items-center space-x-1.5 px-4 py-3 rounded-xl font-extrabold text-xs shadow-md transition shrink-0 ${
                  copiedShort 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
                id="copy-short-link-btn"
              >
                {copiedShort ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedShort ? 'Tersalin!' : 'Salin Link Pendek'}</span>
              </button>
            </div>

            {copiedShort && (
              <p className="text-xs font-bold text-emerald-700 flex items-center space-x-1 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Link pendek disalin! Siap ditempel di Chrome, Safari, WhatsApp, dll.</span>
              </p>
            )}

            {!shortUrl && !isShortening && (
              <button
                onClick={handleGenerateShortLink}
                className="text-xs font-bold text-emerald-700 hover:underline flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Klik untuk mencoba perpendek link lagi</span>
              </button>
            )}
          </div>

          {/* Original Link Box */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Link Web Asli (URL Lengkap):
            </label>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono text-slate-700 truncate select-all font-semibold">
                {appUrl}
              </div>
              <button
                onClick={handleCopyOriginal}
                className={`flex items-center space-x-1 px-3 py-2 rounded-xl font-bold text-xs border transition shrink-0 ${
                  copiedOriginal 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                }`}
                id="copy-original-link-btn"
              >
                {copiedOriginal ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOriginal ? 'Tersalin' : 'Salin Asli'}</span>
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleShareWhatsapp}
              className="flex items-center justify-center space-x-2 p-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs transition shadow-md hover:shadow-emerald-600/30"
              id="share-whatsapp-btn"
            >
              <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
              <span>Kirim ke WhatsApp</span>
            </button>
            <button
              onClick={handleOpenNewTab}
              className="flex items-center justify-center space-x-2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition border border-slate-200"
              id="open-new-tab-btn"
            >
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              <span>Buka di Tab Baru</span>
            </button>
          </div>

          {/* QR Code Scan Section */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="w-28 h-28 bg-white p-2 rounded-xl border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={qrCodeImageUrl} 
                alt="QR Code Aplikasi SIPENDUK" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center sm:text-left space-y-1">
              <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-slate-900 font-extrabold text-xs">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Pindai Kamera HP / Tablet</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Arahkan kamera HP Android / iPhone ke Kode QR ini untuk membuka aplikasi secara langsung di browser tanpa perlu mengetik alamat URL.
              </p>
            </div>
          </div>

          {/* Cross Browser Guide */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2 text-xs text-slate-800">
            <div className="flex items-center space-x-1.5 font-bold text-amber-900 text-[11px]">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Cara Membuka di Browser Lain (Chrome / Safari / Firefox / Edge):</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-700 font-medium pl-1">
              <li>Klik tombol <strong>Salin Link Pendek</strong> di atas.</li>
              <li>Buka browser pilihan Anda (misal: <em>Google Chrome</em>, <em>Safari</em>, <em>Microsoft Edge</em>, atau <em>Mozilla Firefox</em>).</li>
              <li>Tempel (Paste) link di kotak pencarian/URL bar browser lalu tekan Enter/Go.</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
