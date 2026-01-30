
import React from 'react';
import Image from 'next/image';
import { IOrder } from '@/models/all';

interface PrintOrderReceiptProps {
    order: IOrder;
}

const PrintOrderReceipt: React.FC<PrintOrderReceiptProps> = ({ order }) => {
    // Parsing date for display
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB'); // DD/MM/YYYY format
    const orderTime = new Date(order.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <>
            <style type="text/css" media="print">
                {`
                @page { 
                    size: auto; 
                    margin: 5mm;
                }
                html, body { 
                    width: 100% !important;
                    height: auto !important;
                    margin: 0 !important; 
                    padding: 0 !important;
                    background-color: white !important;
                }
                body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .print\:block { 
                    width: 100% !important;
                    min-height: 100vh !important;
                    position: relative !important;
                    display: flex !important;
                    flex-direction: column !important;
                    background-color: white !important;
                    padding: 10mm !important;
                    box-sizing: border-box !important;
                }
                /* Hide everything else */
                body > *:not(.print\:block) { display: none !important; }
                `}
            </style>
            <div className="hidden print:block font-sans text-black w-full bg-white">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center text-center mb-8 w-full border-b-2 border-black pb-6">
                    {/* Logo */}
                    <div className="w-24 h-24 relative mb-4">
                        <img src="/logo.jpg" alt="Logo" className="object-contain w-full h-full mx-auto" />
                    </div>

                    <h1 className="text-4xl font-bold font-serif tracking-widest uppercase mb-2">Aladdin store India</h1>

                    <div className="text-sm font-semibold px-4 leading-relaxed max-w-2xl mx-auto">
                        Aladdin Store trivandrum, trivandrum, Kerala - 695008
                    </div>

                    <div className="text-sm mt-3 font-bold">
                        <div>{orderDate} at {orderTime}</div>
                        <div>Phone: +91 9567255785</div>
                    </div>
                </div>


                {/* Customer Details Section */}
                <div className="space-y-4 text-base font-bold mb-10 px-2">
                    <div className="flex border-b border-gray-100 pb-2">
                        <span className="w-40 shrink-0 text-gray-500 uppercase text-xs">Customer Name</span>
                        <span className="text-lg">{order.customer.name} ({order.customer.age} Yrs)</span>
                    </div>
                    <div className="flex border-b border-gray-100 pb-2">
                        <span className="w-40 shrink-0 text-gray-500 uppercase text-xs">Phone Number</span>
                        <span className="text-lg">{order.customer.phone}</span>
                    </div>
                    <div className="flex items-start border-b border-gray-100 pb-2">
                        <span className="w-40 shrink-0 text-gray-500 uppercase text-xs">Shipping Address</span>
                        <div className="flex flex-col text-lg uppercase">
                            <span className="font-black">{order.customer.address}</span>
                            {order.customer.landmark && <span className="text-sm">{order.customer.landmark}</span>}
                            <span>{order.customer.city} - {order.customer.pincode}</span>
                        </div>
                    </div>
                </div>

                {/* Order Summary Section */}
                <div className="border-2 border-black p-6 mb-8 rounded-xl">
                    <h2 className="text-xs font-black uppercase mb-4 tracking-widest text-center border-b pb-2">Payment Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-lg font-medium">
                            <span>Items Subtotal:</span>
                            <span>₹{order.products.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-medium">
                            <span>Delivery Charge:</span>
                            <span>₹100</span>
                        </div>
                        <div className="flex justify-between text-3xl font-black pt-4 border-t-2 border-dashed border-black mt-2">
                            <span>TOTAL PAID:</span>
                            <span className="text-blue-600">₹{order.totalPrice}</span>
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <span className="bg-black text-white px-4 py-1 rounded text-xs font-bold uppercase tracking-widest">
                            Mode: {order.paymentMode} | Status: {order.paymentStatus || 'COD'}
                        </span>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="mt-auto pt-8 border-t-2 border-black flex justify-between items-center">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase">Order Identifier</span>
                        <span className="text-lg font-black font-mono tracking-tighter">#{order._id.toString().toUpperCase()}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold italic">Thank you for shopping with us!</p>
                        <p className="text-[10px] text-gray-400">This is a system generated invoice</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrintOrderReceipt;
