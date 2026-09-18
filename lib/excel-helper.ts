import * as XLSX from 'xlsx';
import { Resident, VillageProfile } from '@/types/resident';

export function exportResidentsToExcel(residents: Resident[], villageName: string = 'Waihatu', customFileName?: string) {
  if (!residents || residents.length === 0) return false;

  const exportData = residents.map((r, idx) => ({
    No: idx + 1,
    NIK: `'${r.nik}`,
    No_KK: `'${r.noKk}`,
    Nama_Lengkap: r.nama,
    Tempat_Lahir: r.tempatLahir,
    Tanggal_Lahir: r.tanggalLahir,
    Jenis_Kelamin: r.jenisKelamin,
    Agama: r.agama,
    Status_Perkawinan: r.statusPerkawinan,
    Tanggal_Perkawinan: r.tanggalPerkawinan || '-',
    Kewarganegaraan: r.kewarganegaraan || 'WNI',
    Nama_Ayah: r.namaAyah || '-',
    Nama_Ibu: r.namaIbu || '-',
    Pendidikan: r.pendidikan,
    Pekerjaan: r.pekerjaan,
    Hubungan_KK: r.hubunganKk,
    Alamat: r.alamat,
    Dusun: r.dusun,
    RT: r.rt,
    RW: r.rw,
    Status_Penduduk: r.statusPenduduk,
    No_HP: r.noHp || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Database_Penduduk');
  
  // Auto column width adjustment
  const colWidths = [
    { wch: 6 },  // No
    { wch: 20 }, // NIK
    { wch: 20 }, // No_KK
    { wch: 25 }, // Nama
    { wch: 15 }, // Tempat Lahir
    { wch: 14 }, // Tanggal Lahir
    { wch: 14 }, // Gender
    { wch: 18 }, // Agama
    { wch: 18 }, // Status Kawin
    { wch: 16 }, // Tgl Kawin
    { wch: 16 }, // Kewarganegaraan
    { wch: 22 }, // Nama Ayah
    { wch: 22 }, // Nama Ibu
    { wch: 15 }, // Pendidikan
    { wch: 25 }, // Pekerjaan
    { wch: 20 }, // Hubungan KK
    { wch: 30 }, // Alamat
    { wch: 18 }, // Dusun
    { wch: 8 },  // RT
    { wch: 8 },  // RW
    { wch: 15 }, // Status Penduduk
    { wch: 16 }  // No HP
  ];
  worksheet['!cols'] = colWidths;

  const fileName = customFileName || `Database_Penduduk_Desa_${villageName.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
  return true;
}
