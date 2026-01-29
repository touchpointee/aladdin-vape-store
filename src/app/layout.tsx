import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: 'Aladdin Vape Store',
  description: 'Your one stop shop for vapes',
  icons: {
    icon: '/logo.jpg'
  }
};

// Force dynamic to ensure we get fresh data
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-gray-200 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
