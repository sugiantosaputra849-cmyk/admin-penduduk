import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'SIPENDUK - Sistem Informasi Pendataan Penduduk Desa Waihatu',
  description: 'Sistem Informasi Pendataan Penduduk Desa Waihatu untuk pengelolaan data penduduk, Kartu Keluarga, laporan, dan statistik.',
  openGraph: {
    title: 'SIPENDUK - Sistem Informasi Pendataan Penduduk Desa Waihatu',
    description: 'Sistem Informasi Pendataan Penduduk Desa Waihatu untuk pengelolaan data penduduk, Kartu Keluarga, laporan, dan statistik.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SIPENDUK - Sistem Informasi Pendataan Penduduk Desa Waihatu',
    description: 'Sistem Informasi Pendataan Penduduk Desa Waihatu untuk pengelolaan data penduduk, Kartu Keluarga, laporan, dan statistik.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
