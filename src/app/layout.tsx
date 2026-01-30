import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import AgeVerification from '@/components/common/AgeVerification';
import Script from 'next/script';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  metadataBase: new URL('https://aladdinvapestoreindia.com'),
  alternates: {
    canonical: '/',
  },
  title: {
    default: 'Aladdin Vape Store | Best Vapes in India',
    template: '%s | Aladdin Vape Store'
  },
  description: 'Shop the best premium vapes, disposable pods, e-liquids and accessories in India at Aladdin Vape Store. Fast delivery and authentic products.',
  keywords: ['vape india', 'disposable vape india', 'e-liquid india', 'vape pods online', 'aladdin vapestore', 'premium vapes india', 'buy vapes online india', 'vape price india', 'vape shop near me', 'iget india price', 'elf bar india', 'vape cash on delivery india'],
  authors: [{ name: 'Aladdin Vape Store' }],
  creator: 'Aladdin Vape Store',
  publisher: 'Aladdin Vape Store',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/logo.jpg',
    apple: '/logo.jpg',
  },
  openGraph: {
    title: 'Aladdin Vape Store | Best Vapes in India',
    description: 'Shop the best premium vapes, disposable pods, e-liquids and accessories in India at Aladdin Vape Store.',
    url: 'https://aladdinvapestoreindia.com',
    siteName: 'Aladdin Vape Store',
    images: [
      {
        url: '/promo-banner.png',
        width: 1200,
        height: 630,
        alt: 'Aladdin Vape Store - Premium Vapes India',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aladdin Vape Store | Best Vapes in India',
    description: 'Premium vapes and accessories in India. Authentic products and fast delivery.',
    images: ['/promo-banner.png'],
  },
  verification: {
    google: 'G-X3QGJNV4R9',
  },
};

// Revalidation is handled at the page level for optimal performance

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-X3QGJNV4R9"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-X3QGJNV4R9');
          `}
        </Script>
      </head>
      <body className={`${poppins.className} bg-gray-200 min-h-screen`}>
        <AgeVerification />
        {children}
      </body>
    </html>
  );
}
