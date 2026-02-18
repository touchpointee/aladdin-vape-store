import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import CartDrawer from '@/components/cart/CartDrawer';
import DownloadAppBanner from '@/components/layout/DownloadAppBanner';
import connectDB from "@/lib/db";
import { Category } from "@/models/unified";
import FloatingWhatsApp from '@/components/common/FloatingWhatsApp';

export default async function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    // Fetch Categories for Header
    let categories = [];
    try {
        const conn = await connectDB();
        if (conn) {
            categories = await Category.find({ status: { $regex: '^active$', $options: 'i' } }).sort({ createdAt: -1 }).limit(8).lean();
            // Serialize
            categories = categories.map(c => ({ ...c, _id: c._id.toString() } as any));
        }
    } catch (error) {
        console.warn("Failed to fetch navigation data:", error);
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center">

            <div className="w-full min-h-screen bg-white relative flex flex-col transition-all duration-300">

                {/* Download app banner - First purchase 10% off */}
                <div className="flex-none">
                    <DownloadAppBanner />
                </div>

                {/* Header - Sticky on Mobile, Normal on Desktop */}
                <div className="flex-none z-50 sticky top-0">
                    <Header categories={categories} />
                </div>

                {/* Main Content */}
                <main className="flex-1 bg-gray-50 md:bg-white relative z-0">
                    {children}
                </main>

                {/* Cart Drawer - Global */}
                <CartDrawer />

                {/* Global WhatsApp Button */}
                <FloatingWhatsApp />

                {/* Bottom Nav - MOBILE ONLY (Hidden on MD+) */}
                <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
                    <BottomNav />
                </div>

                {/* Desktop Footer Placeholder */}
                <div className="hidden md:block p-8 border-t bg-gray-100 mt-8 text-center text-gray-500">
                    <p className="text-sm">&copy; 2024 Aladdin Vape Store. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}
