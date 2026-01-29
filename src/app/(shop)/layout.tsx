import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import CartDrawer from '@/components/cart/CartDrawer';
import connectDB from "@/lib/db";
import { Category } from "@/models/all";
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
            categories = await Category.find({ status: 'active' }).sort({ createdAt: -1 }).limit(8).lean();
            // Serialize
            categories = categories.map(c => ({ ...c, _id: c._id.toString() } as any));
        }
    } catch (error) {
        console.warn("Failed to fetch navigation data:", error);
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col items-center">

            <div className="w-full h-[100dvh] md:h-auto md:min-h-screen bg-white relative flex flex-col md:overflow-visible transition-all duration-300">

                {/* Header - Sticky on Mobile, Normal on Desktop */}
                <div className="flex-none z-50 sticky top-0">
                    <Header categories={categories} />
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto md:overflow-visible bg-gray-50 md:bg-white scrollbar-hide relative z-0">
                    {children}
                </main>

                {/* Cart Drawer - Global */}
                <CartDrawer />

                {/* Global WhatsApp Button */}
                <FloatingWhatsApp />

                {/* Bottom Nav - MOBILE ONLY (Hidden on MD+) */}
                <div className="flex-none z-40 md:hidden">
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
