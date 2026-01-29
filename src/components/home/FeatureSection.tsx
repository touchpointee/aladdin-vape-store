import { Truck, ShieldCheck, Headphones, Award } from "lucide-react";

export default function FeatureSection() {
    return (
        <div className="py-12 bg-white border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

                    {/* Feature 1 */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
                            <Truck size={32} />
                        </div>
                        <h4 className="font-bold text-gray-900 uppercase text-sm mb-1">Free Shipping</h4>
                        <p className="text-xs text-gray-500">On all orders over $50</p>
                    </div>

                    {/* Feature 2 */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
                            <ShieldCheck size={32} />
                        </div>
                        <h4 className="font-bold text-gray-900 uppercase text-sm mb-1">Secure Payment</h4>
                        <p className="text-xs text-gray-500">100% secure payment</p>
                    </div>

                    {/* Feature 3 */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
                            <Headphones size={32} />
                        </div>
                        <h4 className="font-bold text-gray-900 uppercase text-sm mb-1">24/7 Support</h4>
                        <p className="text-xs text-gray-500">Dedicated support</p>
                    </div>

                    {/* Feature 4 */}
                    <div className="flex flex-col items-center text-center group">
                        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-600 mb-4 group-hover:scale-110 transition-transform">
                            <Award size={32} />
                        </div>
                        <h4 className="font-bold text-gray-900 uppercase text-sm mb-1">100% Authentic</h4>
                        <p className="text-xs text-gray-500">Genuine products only</p>
                    </div>

                </div>
            </div>
        </div>
    );
}
