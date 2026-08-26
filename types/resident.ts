export type JenisKelamin = 'Laki-laki' | 'Perempuan';

export type Agama = 'Islam' | 'Kristen Protestan' | 'Katolik' | 'Hindu' | 'Buddha' | 'Khonghucu';

export type StatusPerkawinan = 'Belum Menikah' | 'Menikah' | 'Cerai Hidup' | 'Cerai Mati';

export type Kewarganegaraan = 'WNI' | 'WNA';

export type Pendidikan = 
  | 'Tidak/Belum Sekolah'
  | 'SD'
  | 'SMP'
  | 'SMA/SMK'
  | 'D3'
  | 'S1'
  | 'S2'
  | 'S3';

export type HubunganKk = 
  | 'Kepala Keluarga'
  | 'Istri'
  | 'Anak'
  | 'Cucu'
  | 'Orang Tua'
  | 'Mertua'
  | 'Famili Lain';

export type StatusPenduduk = 'Tetap' | 'Kontrak/Sewa' | 'Pendatang' | 'Pindah';

export type KategoriUmur = 'Balita' | 'Anak' | 'Remaja' | 'Dewasa' | 'Lansia';

export interface Resident {
  id: string;
  nik: string; // 16 digits
  noKk: string; // 16 digits
  nama: string;
  tempatLahir: string;
  tanggalLahir: string; // YYYY-MM-DD
  jenisKelamin: JenisKelamin;
  agama: Agama;
  statusPerkawinan: StatusPerkawinan;
  tanggalPerkawinan?: string;
  kewarganegaraan: Kewarganegaraan;
  namaAyah?: string;
  namaIbu?: string;
  pendidikan: Pendidikan;
  pekerjaan: string;
  hubunganKk: HubunganKk;
  alamat: string;
  dusun: string; // e.g., Dusun Waihatu, Dusun Sukamaju
  rt: string;
  rw: string;
  statusPenduduk: StatusPenduduk;
  noHp: string;
  foto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KartuKeluargaData {
  noKk: string;
  kepalaKeluarga: string;
  nikKepala: string;
  alamat: string;
  dusun: string;
  rt: string;
  rw: string;
  anggota: Resident[];
  jumlahAnggota: number;
}

export interface VillageProfile {
  namaDesa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
  alamatKantor: string;
  emailDesa: string;
  teleponDesa: string;
  namaKepalaDesa: string;
  nipKepalaDesa: string;
  tahunPendataan: number;
  logoUrl?: string;
  logoKabupatenUrl?: string;
}

export function getAge(tanggalLahir: string): number {
  if (!tanggalLahir) return 0;
  const today = new Date();
  const birthDate = new Date(tanggalLahir);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

export function getKategoriUmur(age: number): KategoriUmur {
  if (age <= 5) return 'Balita';
  if (age <= 11) return 'Anak';
  if (age <= 17) return 'Remaja';
  if (age <= 59) return 'Dewasa';
  return 'Lansia';
}
