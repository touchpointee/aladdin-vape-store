'use client';

import Link from 'next/link';
import { Smartphone, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'download_app_banner_dismissed';

export default function DownloadAppBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      setDismissed(stored === '1'); // hide only if user dismissed
    } catch {
      setDismissed(false);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
      setDismissed(true);
    } catch {}
  };

  if (dismissed) return null;

  return (
    <div className="w-full bg-blue-600 text-white flex items-center justify-center gap-2 py-2.5 px-4 relative z-[60]">
      <Smartphone size={18} className="flex-shrink-0" />
      <Link
        href="/download-app"
        className="font-semibold text-sm hover:underline focus:underline"
      >
        Download our app — First purchase 10% off
      </Link>
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-2 p-1 rounded hover:bg-white/20 focus:outline-none"
        aria-label="Dismiss"
      >
        <X size={18} />
      </button>
    </div>
  );
}
