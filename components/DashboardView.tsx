'use client';

import React, { useState, useMemo } from 'react';
import { useResidents } from '@/context/ResidentContext';
import { 
  Users, 
  UserCheck, 
  Home, 
  MapPin, 
  TrendingUp, 
  UserPlus, 
  FileSpreadsheet, 
  Sparkles, 
  Calendar, 
  Briefcase,
  GraduationCap,
  Heart,
  BarChart3,
  PieChart as PieIcon,
  Activity,
  Award,
  ArrowRight,
  Scale,
  Percent,
  CheckCircle2,
  Building2,
  Filter,
  BookOpen,
  Tractor,
  BadgeCheck,
  Layers
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Resident, getAge, getKategoriUmur } from '@/types/resident';

interface DashboardViewProps {
  onOpenAddModal: () => void;
  onViewResidentDetail: (resident: Resident) => void;
}

export function DashboardView({ onOpenAddModal, onViewResidentDetail }: DashboardViewProps) {
  const { 
    stats, 
    residents, 
    villageProfile, 
    setActiveTab, 
    setSelectedDusunFilter,
    kartuKeluargaList
  } = useResidents();

  const [activeStatTab, setActiveStatTab] = useState<'ringkasan' | 'piramida' | 'sosial' | 'dusun'>('ringkasan');

  // Colors
  const GENDER_COLORS = ['#2563eb', '#ec4899'];
  const AGE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
  const STATUS_COLORS = ['#059669', '#0284c7', '#d97706', '#dc2626'];

  // Calculations for modern demographic analytics
  const analytics = useMemo(() => {
    const total = residents.length;
    if (total === 0) {
      return {
        usiaProduktif: 0,
        pctProduktif: '0',
        dependencyRatio: '0',
        hakPilih: 0,
        pctHakPilih: '0',
        avgKkSize: '0',
        pendidikanDist: [],
        pendidikanKelompok: [],
        wajibBelajarCount: 0,
        wajibBelajarPct: '0',
        lulusanTinggiCount: 0,
        lulusanTinggiPct: '0',
        pekerjaanAll: [],
        pekerjaanTop: [],
        sektorDist: [],
        dominantSector: { name: '-', count: 0, pct: '0', desc: '-', color: '#10b981' },
        angkatanKerjaAktifCount: 0,
        angkatanKerjaAktifPct: '0',
        agamaDist: [],
        statusKawinDist: [],
        pyramidData: [],
        statusPendudukDist: []
      };
    }

    let produktifCount = 0; // 15-64
    let nonProduktifCount = 0; // <15 or 65+
    let hakPilihCount = 0; // 17+

    // Pyramid brackets: 0-5, 6-11, 12-17, 18-59, 60+
    const brackets = [
      { label: '0-5 Th', laki: 0, perempuan: 0 },
      { label: '6-11 Th', laki: 0, perempuan: 0 },
      { label: '12-17 Th', laki: 0, perempuan: 0 },
      { label: '18-59 Th', laki: 0, perempuan: 0 },
      { label: '60+ Th', laki: 0, perempuan: 0 }
    ];

    const agamaMap = new Map<string, number>();
    const kawinMap = new Map<string, number>();
    const eduMap = new Map<string, number>();
    const jobMap = new Map<string, number>();
    const statusPendudukMap = new Map<string, number>();

    residents.forEach((r) => {
      const age = getAge(r.tanggalLahir);

      if (age >= 15 && age <= 64) produktifCount++;
      else nonProduktifCount++;

      if (age >= 17) hakPilihCount++;

      // Pyramid classification
      if (age <= 5) {
        if (r.jenisKelamin === 'Laki-laki') brackets[0].laki++; else brackets[0].perempuan++;
      } else if (age <= 11) {
        if (r.jenisKelamin === 'Laki-laki') brackets[1].laki++; else brackets[1].perempuan++;
      } else if (age <= 17) {
        if (r.jenisKelamin === 'Laki-laki') brackets[2].laki++; else brackets[2].perempuan++;
      } else if (age <= 59) {
        if (r.jenisKelamin === 'Laki-laki') brackets[3].laki++; else brackets[3].perempuan++;
      } else {
        if (r.jenisKelamin === 'Laki-laki') brackets[4].laki++; else brackets[4].perempuan++;
      }

      // Agama
      const ag = r.agama || 'Lainnya';
      agamaMap.set(ag, (agamaMap.get(ag) || 0) + 1);

      // Status Perkawinan
      const sk = r.statusPerkawinan || 'Belum Menikah';
      kawinMap.set(sk, (kawinMap.get(sk) || 0) + 1);

      // Pendidikan
      const edu = r.pendidikan || 'Tidak/Belum Sekolah';
      eduMap.set(edu, (eduMap.get(edu) || 0) + 1);

      // Pekerjaan
      const job = r.pekerjaan || 'Lainnya';
      jobMap.set(job, (jobMap.get(job) || 0) + 1);

      // Status Penduduk
      const sp = r.statusPenduduk || 'Tetap';
      statusPendudukMap.set(sp, (statusPendudukMap.get(sp) || 0) + 1);
    });

    const pctProduktif = ((produktifCount / total) * 100).toFixed(1);
    const dependencyRatio = produktifCount > 0 ? ((nonProduktifCount / produktifCount) * 100).toFixed(1) : '0';
    const pctHakPilih = ((hakPilihCount / total) * 100).toFixed(1);
    const avgKkSize = kartuKeluargaList.length > 0 ? (total / kartuKeluargaList.length).toFixed(1) : '0';

    // Format education distributions
    const eduOrdered = ['Tidak/Belum Sekolah', 'SD', 'SMP', 'SMA/SMK', 'D3', 'S1', 'S2', 'S3'];
    const pendidikanDist = eduOrdered.map((level) => ({
      name: level,
      count: eduMap.get(level) || 0,
      pct: (((eduMap.get(level) || 0) / total) * 100).toFixed(1)
    }));

    const countBelumSekolah = eduMap.get('Tidak/Belum Sekolah') || 0;
    const countDasar = (eduMap.get('SD') || 0) + (eduMap.get('SMP') || 0);
    const countMenengah = eduMap.get('SMA/SMK') || 0;
    const countTinggi = (eduMap.get('D3') || 0) + (eduMap.get('S1') || 0) + (eduMap.get('S2') || 0) + (eduMap.get('S3') || 0);

    const pendidikanKelompok = [
      { name: 'Belum Sekolah', value: countBelumSekolah, pct: ((countBelumSekolah / total) * 100).toFixed(1), color: '#94a3b8' },
      { name: 'Pendidikan Dasar (SD/SMP)', value: countDasar, pct: ((countDasar / total) * 100).toFixed(1), color: '#3b82f6' },
      { name: 'Pendidikan Menengah (SMA/SMK)', value: countMenengah, pct: ((countMenengah / total) * 100).toFixed(1), color: '#f59e0b' },
      { name: 'Pendidikan Tinggi (D3-S3)', value: countTinggi, pct: ((countTinggi / total) * 100).toFixed(1), color: '#10b981' }
    ];

    const wajibBelajarCount = total - countBelumSekolah;
    const wajibBelajarPct = ((wajibBelajarCount / total) * 100).toFixed(1);
    const lulusanTinggiCount = countTinggi;
    const lulusanTinggiPct = ((countTinggi / total) * 100).toFixed(1);

    // Format job / occupation distributions
    const pekerjaanAll = Array.from(jobMap.entries())
      .map(([name, count]) => ({ name, count, pct: ((count / total) * 100).toFixed(1) }))
      .sort((a, b) => b.count - a.count);

    const pekerjaanTop = pekerjaanAll.slice(0, 8);

    // Economic sector breakdown
    let pertanianCount = 0;
    let swastaCount = 0;
    let pelayanPublikCount = 0;
    let nonAngkatanCount = 0;

    const pertanianKeywords = ['petani', 'pekebun', 'nelayan', 'peternak', 'tani', 'kebun', 'ikan'];
    const pelayanKeywords = ['pns', 'guru', 'dosen', 'tni', 'polri', 'perangkat desa', 'asn', 'dokter', 'bidan', 'perawat', 'pemerintah'];
    const nonAngkatanKeywords = ['pelajar', 'mahasiswa', 'mengurus rumah tangga', 'rumah tangga', 'belum/tidak bekerja', 'tidak bekerja', 'pensiunan', 'balita'];

    jobMap.forEach((count, jobName) => {
      const lower = jobName.toLowerCase();
      if (pertanianKeywords.some(k => lower.includes(k))) {
        pertanianCount += count;
      } else if (pelayanKeywords.some(k => lower.includes(k))) {
        pelayanPublikCount += count;
      } else if (nonAngkatanKeywords.some(k => lower.includes(k))) {
        nonAngkatanCount += count;
      } else {
        swastaCount += count;
      }
    });

    const angkatanKerjaAktifCount = total - nonAngkatanCount;
    const angkatanKerjaAktifPct = ((angkatanKerjaAktifCount / total) * 100).toFixed(1);

    const sektorDist = [
      { 
        name: 'Pertanian & Kelautan', 
        count: pertanianCount, 
        pct: ((pertanianCount / total) * 100).toFixed(1),
        desc: 'Petani, Pekebun, Nelayan, Peternak',
        color: '#10b981'
      },
      { 
        name: 'Usaha, Swasta & Jasa', 
        count: swastaCount, 
        pct: ((swastaCount / total) * 100).toFixed(1),
        desc: 'Wiraswasta, Karyawan Swasta, Pedagang, Buruh',
        color: '#3b82f6'
      },
      { 
        name: 'Pelayanan Publik & ASN', 
        count: pelayanPublikCount, 
        pct: ((pelayanPublikCount / total) * 100).toFixed(1),
        desc: 'PNS, Guru, Dosen, TNI, POLRI, Perangkat Desa',
        color: '#8b5cf6'
      },
      { 
        name: 'Non-Angkatan Kerja', 
        count: nonAngkatanCount, 
        pct: ((nonAngkatanCount / total) * 100).toFixed(1),
        desc: 'Pelajar, Ibu Rumah Tangga, Belum Bekerja, Pensiunan',
        color: '#64748b'
      }
    ];

    const dominantSector = [...sektorDist].sort((a, b) => b.count - a.count)[0];

    const agamaDist = Array.from(agamaMap.entries()).map(([name, count]) => ({
      name,
      count,
      pct: ((count / total) * 100).toFixed(1)
    }));

    const statusKawinDist = Array.from(kawinMap.entries()).map(([name, count]) => ({
      name,
      count,
      pct: ((count / total) * 100).toFixed(1)
    }));

    const statusPendudukDist = Array.from(statusPendudukMap.entries()).map(([name, count]) => ({
      name,
      count,
      pct: ((count / total) * 100).toFixed(1)
    }));

    return {
      usiaProduktif: produktifCount,
      pctProduktif,
      dependencyRatio,
      hakPilih: hakPilihCount,
      pctHakPilih,
      avgKkSize,
      pendidikanDist,
      pendidikanKelompok,
      wajibBelajarCount,
      wajibBelajarPct,
      lulusanTinggiCount,
      lulusanTinggiPct,
      pekerjaanAll,
      pekerjaanTop,
      sektorDist,
      dominantSector,
      angkatanKerjaAktifCount,
      angkatanKerjaAktifPct,
      agamaDist,
      statusKawinDist,
      pyramidData: brackets,
      statusPendudukDist
    };
  }, [residents, kartuKeluargaList]);

  const genderData = [
    { name: 'Laki-laki', value: stats.lakiLaki },
    { name: 'Perempuan', value: stats.perempuan }
  ];

  const ageData = [
    { name: 'Balita (0-5 th)', count: stats.balita },
    { name: 'Anak (6-11 th)', count: stats.anak },
    { name: 'Remaja (12-17 th)', count: stats.remaja },
    { name: 'Dewasa (18-59 th)', count: stats.dewasa },
    { name: 'Lansia (60+ th)', count: stats.lansia }
  ];

  // Recent residents
  const recentResidents = [...residents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-emerald-700/30">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-800/60 backdrop-blur-md px-3 py-1 rounded-full text-xs text-emerald-200 border border-emerald-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Analitik Demografi Real-time Desa Waihatu</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Dashboard Statistik Desa {villageProfile.namaDesa}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl mt-1 leading-relaxed">
              Monitoring kependudukan presisi, indeks demografi produktif, rasio ketergantungan, serta struktur sosial warga Kecamatan {villageProfile.kecamatan}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenAddModal}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition flex items-center space-x-2"
              id="dashboard-add-btn"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Penduduk</span>
            </button>
            <button
              onClick={() => setActiveTab('laporan')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow border border-slate-700 transition flex items-center space-x-2"
              id="dashboard-laporan-btn"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Cetak Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Key Performance Cards - Modern Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-kpi-cards">
        {/* Total Penduduk */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Penduduk</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {stats.totalPenduduk.toLocaleString('id-ID')} <span className="text-xs text-slate-400 font-normal">Jiwa</span>
            </div>
            <div className="mt-2 flex items-center space-x-1.5 text-xs text-emerald-700 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{stats.jumlahKk} Kartu Keluarga</span>
            </div>
          </div>
        </div>

        {/* Usia Produktif Index */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Usia Produktif (15-64)</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {analytics.pctProduktif}%
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>{analytics.usiaProduktif} Jiwa Produktif</span>
              <span className="font-semibold text-blue-600">Bonus Demografi</span>
            </div>
          </div>
        </div>

        {/* Dependency Ratio */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Rasio Ketergantungan</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {analytics.dependencyRatio} <span className="text-xs text-slate-400 font-normal">%</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>Beban Usia Non-Produktif</span>
              <span className="font-semibold text-amber-600">Sangat Rendah</span>
            </div>
          </div>
        </div>

        {/* Pemilih Potensial (DPT) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pemilih Potensial (17+)</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {analytics.hakPilih.toLocaleString('id-ID')} <span className="text-xs text-slate-400 font-normal">Warga</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>{analytics.pctHakPilih}% Usia Hak Pilih</span>
              <span className="font-semibold text-purple-600">Wajib KTP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs for Modern Analytical Views */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex flex-wrap gap-1 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveStatTab('ringkasan')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 ${
            activeStatTab === 'ringkasan'
              ? 'bg-slate-900 text-white font-bold shadow'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          <span>Ikhtisar Demografi & Usia</span>
        </button>

        <button
          onClick={() => setActiveStatTab('piramida')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 ${
            activeStatTab === 'piramida'
              ? 'bg-slate-900 text-white font-bold shadow'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <PieIcon className="w-4 h-4 text-blue-400" />
          <span>Piramida & Struktur Usia</span>
        </button>

        <button
          onClick={() => setActiveStatTab('sosial')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 ${
            activeStatTab === 'sosial'
              ? 'bg-slate-900 text-white font-bold shadow'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-amber-400" />
          <span>Pendidikan & Pekerjaan</span>
        </button>

        <button
          onClick={() => setActiveStatTab('dusun')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center space-x-2 ${
            activeStatTab === 'dusun'
              ? 'bg-slate-900 text-white font-bold shadow'
              : 'hover:bg-slate-100 text-slate-700'
          }`}
        >
          <MapPin className="w-4 h-4 text-rose-400" />
          <span>Distribusi Wilayah Dusun</span>
        </button>
      </div>

      {/* TAB 1: RINGKASAN DEMOGRAFI */}
      {activeStatTab === 'ringkasan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gender Ratio Card with Radial Ring visual */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">Rasio Jenis Kelamin</h3>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  Sex Ratio: {stats.perempuan > 0 ? ((stats.lakiLaki / stats.perempuan) * 100).toFixed(0) : 100}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Perbandingan jumlah warga Laki-laki & Perempuan</p>
            </div>

            <div className="h-52 my-3 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`gender-cell-${index}`} fill={GENDER_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-slate-900">{stats.totalPenduduk}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Warga</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
              <div className="p-2 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span className="font-semibold text-slate-700">Laki-laki</span>
                </div>
                <strong className="text-blue-900">{stats.lakiLaki}</strong>
              </div>

              <div className="p-2 bg-pink-50/60 rounded-xl border border-pink-100 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span className="font-semibold text-slate-700">Perempuan</span>
                </div>
                <strong className="text-pink-900">{stats.perempuan}</strong>
              </div>
            </div>
          </div>

          {/* Age Distribution Breakdown Bar Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Klasifikasi Kelompok Usia</h3>
                <p className="text-xs text-slate-500">Distribusi jumlah penduduk berdasarkan tahapan kehidupan</p>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                5 Kategori Utama
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748b" allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" name="Jumlah Jiwa" fill="#10b981" radius={[6, 6, 0, 0]}>
                    {ageData.map((entry, index) => (
                      <Cell key={`age-cell-${index}`} fill={AGE_COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs pt-3 border-t border-slate-100">
              <div className="p-2 bg-blue-50/50 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Balita (0-5)</span>
                <span className="font-bold text-blue-700 text-sm">{stats.balita} Jiwa</span>
              </div>
              <div className="p-2 bg-emerald-50/50 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Anak (6-11)</span>
                <span className="font-bold text-emerald-700 text-sm">{stats.anak} Jiwa</span>
              </div>
              <div className="p-2 bg-purple-50/50 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Remaja (12-17)</span>
                <span className="font-bold text-purple-700 text-sm">{stats.remaja} Jiwa</span>
              </div>
              <div className="p-2 bg-amber-50/50 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Dewasa (18-59)</span>
                <span className="font-bold text-amber-700 text-sm">{stats.dewasa} Jiwa</span>
              </div>
              <div className="p-2 bg-rose-50/50 rounded-xl text-center">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Lansia (60+)</span>
                <span className="font-bold text-rose-700 text-sm">{stats.lansia} Jiwa</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PIRAMIDA USIA & ANGGOTA KK */}
      {activeStatTab === 'piramida' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pyramid Chart */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Piramida Penduduk Per Rentang Usia</h3>
                <p className="text-xs text-slate-500">Struktur usia warga pria & wanita Desa Waihatu</p>
              </div>
              <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-full border border-indigo-200">
                Piramida Ekspansif
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  layout="vertical" 
                  data={analytics.pyramidData} 
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} width={75} stroke="#64748b" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="laki" name="Laki-laki" fill="#2563eb" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="perempuan" name="Perempuan" fill="#ec4899" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KK Density Widget */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Home className="w-4 h-4 text-emerald-600" />
                <span>Statistik Rumah Tangga & KK</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Indikator kepadatan keluarga dalam satu KK</p>
            </div>

            <div className="space-y-3 my-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Rata-Rata Jiwa / KK</span>
                  <span className="text-xl font-extrabold text-slate-900">{analytics.avgKkSize} Jiwa</span>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                  Standar Ideal
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Kartu Keluarga</span>
                  <span className="text-xl font-extrabold text-slate-900">{stats.jumlahKk} KK</span>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-bold">
                  Terverifikasi
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('kk')}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center space-x-2"
            >
              <span>Kelola Daftar Kartu Keluarga</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: PENDIDIKAN & PEKERJAAN - MODERN ANALYTICS */}
      {activeStatTab === 'sosial' && (
        <div className="space-y-6">
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Card 1: Perguruan Tinggi */}
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wide text-emerald-100 uppercase">Perguruan Tinggi</span>
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-xs">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black">{analytics.lulusanTinggiCount} <span className="text-sm font-semibold text-emerald-100">Jiwa</span></div>
                <div className="text-xs text-emerald-100 font-medium">{analytics.lulusanTinggiPct}% dari Total Penduduk</div>
              </div>
              <div className="inline-block px-2 py-0.5 bg-white/20 text-[10px] font-bold rounded-full text-emerald-50">
                Jenjang D3, S1, S2, S3
              </div>
            </div>

            {/* Card 2: Melek Aksara / SD+ */}
            <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl text-white shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wide text-amber-100 uppercase">Wajib Belajar SD+</span>
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-xs">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black">{analytics.wajibBelajarPct}%</div>
                <div className="text-xs text-amber-100 font-medium">{analytics.wajibBelajarCount} Jiwa Pernah Sekolah</div>
              </div>
              <div className="inline-block px-2 py-0.5 bg-white/20 text-[10px] font-bold rounded-full text-amber-50">
                SD hingga Perguruan Tinggi
              </div>
            </div>

            {/* Card 3: Angkatan Kerja Aktif */}
            <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl text-white shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wide text-blue-100 uppercase">Angkatan Kerja Aktif</span>
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-xs">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-black">{analytics.angkatanKerjaAktifCount} <span className="text-sm font-semibold text-blue-100">Jiwa</span></div>
                <div className="text-xs text-blue-100 font-medium">{analytics.angkatanKerjaAktifPct}% Bekerja / Usaha</div>
              </div>
              <div className="inline-block px-2 py-0.5 bg-white/20 text-[10px] font-bold rounded-full text-blue-50">
                Sektor Produktif Desa
              </div>
            </div>

            {/* Card 4: Sektor Dominan */}
            <div className="p-4 bg-gradient-to-br from-purple-600 to-violet-700 rounded-2xl text-white shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wide text-purple-100 uppercase">Sektor Pekerjaan Utama</span>
                <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-xs">
                  <Tractor className="w-4 h-4 text-white" />
                </div>
              </div>
              <div>
                <div className="text-lg font-black truncate">{analytics.dominantSector?.name || 'Pertanian'}</div>
                <div className="text-xs text-purple-100 font-medium">{analytics.dominantSector?.count} Jiwa ({analytics.dominantSector?.pct}%)</div>
              </div>
              <div className="inline-block px-2 py-0.5 bg-white/20 text-[10px] font-bold rounded-full text-purple-50 truncate max-w-full">
                Sektor Dominan Desa
              </div>
            </div>
          </div>

          {/* Section 1: Education Breakdown & Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Education Bar Chart */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4 text-amber-600" />
                    <span>Statistik Tingkat Pendidikan Terakhir</span>
                  </h3>
                  <p className="text-xs text-slate-500">Distribusi jenjang kualifikasi pendidikan warga Desa Waihatu</p>
                </div>
                <span className="text-xs bg-amber-50 text-amber-700 font-bold px-2.5 py-1 rounded-full border border-amber-200">
                  8 Jenjang
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.pendidikanDist} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 10, fill: '#475569' }} 
                      interval={0} 
                      angle={-25} 
                      textAnchor="end" 
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip 
                      formatter={(val: any) => [`${val ?? 0} Warga`, 'Jumlah']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" name="Jumlah Warga" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                      {analytics.pendidikanDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index >= 4 ? '#10b981' : index >= 3 ? '#f59e0b' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Rincian Progress Bar Pendidikan */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
                {analytics.pendidikanKelompok.map((group) => (
                  <div key={group.name} className="p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                    <div className="flex items-center space-x-1.5 mb-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                      <span className="text-[10px] font-bold text-slate-600 truncate">{group.name}</span>
                    </div>
                    <div className="font-extrabold text-slate-900 text-sm">{group.value} Jiwa</div>
                    <div className="text-[10px] text-slate-500">{group.pct}% warga</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut Chart: Kelompok Pendidikan */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs lg:col-span-5 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <PieIcon className="w-4 h-4 text-emerald-600" />
                  <span>Komposisi Kelompok Pendidikan</span>
                </h3>
                <p className="text-xs text-slate-500">Kualifikasi agregat pendidikan dasar, menengah, & tinggi</p>
              </div>

              <div className="h-52 w-full my-auto flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.pendidikanKelompok}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analytics.pendidikanKelompok.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val: any) => [`${val ?? 0} Jiwa`, 'Jumlah']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                {analytics.pendidikanKelompok.map((group) => (
                  <div key={group.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color }} />
                      <span className="text-slate-700 font-medium">{group.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{group.value} Jiwa ({group.pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Pekerjaan & Sektor Ekonomi */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Economic Sector Cards */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs lg:col-span-5 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Distribusi Sektor Ekonomi Desa</span>
                </h3>
                <p className="text-xs text-slate-500">Pengelompokan lapangan usaha warga Desa Waihatu</p>
              </div>

              <div className="space-y-3">
                {analytics.sektorDist.map((sektor) => (
                  <div key={sektor.name} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-md" style={{ backgroundColor: sektor.color }} />
                        <span className="font-bold text-slate-900">{sektor.name}</span>
                      </div>
                      <span className="font-extrabold text-slate-900">{sektor.count} Jiwa ({sektor.pct}%)</span>
                    </div>
                    <p className="text-[11px] text-slate-500 pl-5">{sektor.desc}</p>
                    <div className="w-full bg-slate-200/70 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-1.5 rounded-full transition-all duration-500" 
                        style={{ width: `${sektor.pct}%`, backgroundColor: sektor.color }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Jobs Horizontal Chart & Ranking Table */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Briefcase className="w-4 h-4 text-indigo-600" />
                    <span>8 Pekerjaan / Mata Pencaharian Terbanyak</span>
                  </h3>
                  <p className="text-xs text-slate-500">Peringkat profesi utama warga terdaftar</p>
                </div>
                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full border border-indigo-200">
                  {analytics.pekerjaanAll.length} Jenis Profesi
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                {analytics.pekerjaanTop.map((item, index) => (
                  <div key={item.name} className="p-2.5 hover:bg-slate-50 rounded-xl transition space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-2 font-semibold text-slate-800">
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                          index === 0 ? 'bg-amber-100 text-amber-800' :
                          index === 1 ? 'bg-slate-200 text-slate-700' :
                          index === 2 ? 'bg-amber-800/10 text-amber-900' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {index + 1}
                        </span>
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{item.count} Jiwa</span>
                        <span className="text-[11px] text-slate-400 font-medium">({item.pct}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${item.pct}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DISTRIBUSI WILAYAH DUSUN */}
      {activeStatTab === 'dusun' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Statistik Penduduk Berdasarkan Dusun & Wilayah</span>
              </h3>
              <p className="text-xs text-slate-500">Jumlah jiwa dan perbandingan gender di setiap Dusun</p>
            </div>
            <button
              onClick={() => setActiveTab('penduduk')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center space-x-1"
            >
              <span>Filter Menurut Dusun</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.dusunStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 11 }} stroke="#64748b" allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="laki" name="Laki-laki" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="perempuan" name="Perempuan" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            {stats.dusunStats.map((d) => (
              <div 
                key={d.name}
                onClick={() => {
                  setSelectedDusunFilter(d.name);
                  setActiveTab('penduduk');
                }}
                className="p-3 bg-slate-50 hover:bg-emerald-50/60 rounded-xl border border-slate-200/80 hover:border-emerald-300 transition cursor-pointer space-y-1"
              >
                <div className="font-bold text-slate-800 text-xs truncate">{d.name}</div>
                <div className="text-base font-extrabold text-slate-900">{d.total} Jiwa</div>
                <div className="text-[10px] text-slate-500 flex justify-between">
                  <span>L: {d.laki}</span>
                  <span>P: {d.perempuan}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Registered Residents Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5" id="recent-residents-section">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <span>Penduduk Terbaru Terdaftar</span>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {recentResidents.length} Terkini
              </span>
            </h3>
            <p className="text-xs text-slate-500">Pendaftaran data warga yang baru saja dimasukkan ke sistem SIPENDUK</p>
          </div>

          <button
            onClick={() => setActiveTab('penduduk')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center space-x-1 self-start sm:self-auto"
          >
            <span>Kelola Semua Data</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold">Nama Lengkap</th>
                <th className="py-2.5 px-3 font-semibold">NIK</th>
                <th className="py-2.5 px-3 font-semibold">Jenis Kelamin</th>
                <th className="py-2.5 px-3 font-semibold">Umur</th>
                <th className="py-2.5 px-3 font-semibold">Dusun / RT / RW</th>
                <th className="py-2.5 px-3 font-semibold">Pekerjaan</th>
                <th className="py-2.5 px-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentResidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">
                    Belum ada data penduduk yang terdaftar.
                  </td>
                </tr>
              ) : (
                recentResidents.map((r) => {
                  const age = getAge(r.tanggalLahir);
                  const kat = getKategoriUmur(age);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{r.nama}</div>
                        <div className="text-[10px] text-slate-400">KK: {r.noKk}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600">{r.nik}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-medium text-[11px] ${
                          r.jenisKelamin === 'Laki-laki' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'bg-pink-50 text-pink-700 border border-pink-200'
                        }`}>
                          {r.jenisKelamin}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">{age} th</span>
                        <span className="text-[10px] block text-slate-400">{kat}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        <div className="font-medium">{r.dusun}</div>
                        <div className="text-[10px] text-slate-400">RT {r.rt} / RW {r.rw}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{r.pekerjaan || '-'}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onViewResidentDetail(r)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-[11px] transition"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
