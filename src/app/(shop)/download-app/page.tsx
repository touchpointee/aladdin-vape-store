import connectDB from '@/lib/db';
import { Settings } from '@/models/unified';
import Link from 'next/link';
import { Smartphone, Download, ArrowLeft } from 'lucide-react';

export default async function DownloadAppPage() {
  let apkUrl = '';
  try {
    await connectDB();
    const doc = await Settings.findOne({ key: 'app_apk_url' });
    if (doc?.value) apkUrl = doc.value;
  } catch (_) {}

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 font-medium"
        >
          <ArrowLeft size={20} />
          Back to store
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden text-center">
          <div className="bg-gradient-to-b from-blue-600 to-blue-700 px-6 py-10">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              <Smartphone size={40} color="#fff" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Download our app</h1>
            <p className="text-blue-100 text-sm">
              First purchase through the app — get <strong className="text-white">10% off</strong>
            </p>
          </div>

          <div className="p-6 space-y-6">
            <p className="text-gray-600 text-sm">
              Shop on the go, track orders, and use your one-time 10% discount on your first order in the app.
            </p>

            {apkUrl ? (
              <a
                href={apkUrl}
                download
                className="inline-flex items-center justify-center gap-2 w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
              >
                <Download size={22} />
                Download Android app (APK)
              </a>
            ) : (
              <div className="py-4 px-6 bg-gray-100 rounded-xl text-gray-500 text-sm">
                App download will be available soon. Check back later or shop on the website.
              </div>
            )}

            <Link
              href="/"
              className="block w-full py-3 text-gray-600 hover:text-gray-900 font-medium text-sm"
            >
              Continue shopping on website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
