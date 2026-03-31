import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { ClientLayout } from './client-layout';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Aquapool — Your Global Finance Hub',
  description: 'Access crypto, stocks, DeFi, and global remittance in one secure platform.',
  keywords: ['crypto', 'DeFi', 'stocks', 'Web3', 'remittance', 'finance'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aquapool',
  },
  openGraph: {
    title: 'Aquapool',
    description: 'The next-generation Web3 banking platform',
    type: 'website',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#BAFF39',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-dark text-white antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
