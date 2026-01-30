
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
                    size: 100mm 150mm; 
                    margin: 0mm;
                }
                html, body { 
                    width: 100mm !important;
                    height: 150mm !important;
                    margin: 0 !important; 
                    padding: 0 !important;
                    overflow: hidden !important;
                    background-color: white !important;
                }
                body {
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                .print\:block { 
                    width: 100mm !important;
                    height: 150mm !important;
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: space-between !important;
                    background-color: white !important;
                    padding: 5mm !important;
                    box-sizing: border-box !important;
                }
                /* Hide everything else */
                body > *:not(.print\:block) { display: none !important; }
                `}
            </style>
            <div className="hidden print:block font-mono text-black w-full max-w-none bg-white">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center text-center mb-4 w-full">
                    {/* Logo Placeholder */}
                    <div className="w-16 h-16 relative mb-1">
                        <div className="w-full h-full flex items-center justify-center">
                            {/* Using standard img tag for better print compatibility */}
                            <img src="/logo.jpg" alt="Logo" className="object-contain w-full h-full" />
                        </div>
                    </div>

                    <h1 className="text-xl font-bold font-serif tracking-wide border-b-0 w-full text-center">Aladdin store India</h1>

                    <div className="text-xs font-medium px-2 leading-tight w-full text-center">
                        Aladdin Store trivandrum, trivandrum, Kerala - 695008
                    </div>

                    <div className="text-xs mt-1 flex flex-col items-center font-semibold w-full text-center">
                        <div>{orderDate} {orderTime}</div>
                        <div>+91 9567255785</div>
                    </div>
                </div>


                {/* Customer Details Section */}
                <div className="space-y-2 text-xs font-semibold mb-4 px-1 flex-1">
                    <div className="flex">
                        <span className="w-28 shrink-0">Customer Name:</span>
                        <span>{order.customer.name}</span>
                    </div>
                    <div className="flex">
                        <span className="w-28 shrink-0">Phone:</span>
                        <span>{order.customer.phone}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="w-28 shrink-0">Address:</span>
                        <div className="flex flex-col">
                            <span>{order.customer.address}</span>
                            {order.customer.landmark && <span>{order.customer.landmark}</span>}
                            <span className="uppercase">{order.customer.city}, {order.customer.pincode}</span>
                        </div>
                    </div>
                </div>

                {/* Footer / Order Number */}
                <div className="mt-auto pt-2 border-t text-xs font-bold flex justify-between">
                    <span>Order #{order._id.toString().slice(-8).toUpperCase()}</span>
                </div>
            </div>
        </>
    );
};

export default PrintOrderReceipt;
