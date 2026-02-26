import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'MEQC',
  description: 'Application web de gestion academique',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg?v=3', type: 'image/svg+xml' },
      { url: '/icons/icon-192-v2.png?v=3', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512-v2.png?v=3', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon-v2.png?v=3',
    shortcut: '/favicon-eqc.ico?v=3',
  },
  appleWebApp: {
    capable: true,
    title: 'MEQC',
    statusBarStyle: 'default',
  },
};

export const viewport = {
  themeColor: '#0B4DB9',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
