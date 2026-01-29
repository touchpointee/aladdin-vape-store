
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
                @page { size: auto; margin: 20mm; }
                html, body { height: auto !important; overflow: visible !important; }
                `}
            </style>
            <div className="hidden print:block font-mono text-black p-8 max-w-2xl mx-auto bg-white">
                {/* Header Section */}
                <div className="flex flex-col items-center justify-center text-center space-y-4 mb-8 w-full">
                    {/* Logo Placeholder */}
                    <div className="w-24 h-24 relative mb-2">
                        <div className="w-full h-full flex items-center justify-center">
                            {/* Using standard img tag for better print compatibility */}
                            <img src="/logo.jpg" alt="Logo" className="object-contain w-full h-full" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold font-serif tracking-wide border-b-0 w-full text-center">Aladdin store India</h1>

                    <div className="text-sm font-medium px-4 leading-relaxed w-full text-center">
                        Aladdin Store trivandrum, trivandrum, Kerala - 695008
                    </div>

                    <div className="text-sm mt-2 flex flex-col items-center font-semibold w-full text-center">
                        <div>Order Placed On: {orderDate} {orderTime}</div>
                        <div>Phone Number - 9567255785</div>
                    </div>
                </div>


                {/* Customer Details Section */}
                <div className="space-y-3 text-sm font-semibold mb-8 mt-8 px-2">
                    <div className="flex">
                        <span className="w-40 shrink-0">Customer Name -</span>
                        <span>{order.customer.name}</span>
                    </div>
                    <div className="flex">
                        <span className="w-40 shrink-0">Customer Number -</span>
                        <span>{order.customer.phone}</span>
                    </div>
                    <div className="flex items-start">
                        <span className="w-40 shrink-0">Address -</span>
                        <div className="flex flex-col">
                            <span>{order.customer.address},</span>
                            {order.customer.landmark && <span>Landmark : {order.customer.landmark},</span>}
                            {/* Attempting to parse city/state/zip if they are separate or just rendering what is available. 
                       The model seems to have city and pincode.
                   */}
                            <span className="uppercase">{order.customer.city}, KERALA,</span>
                            <span>{order.customer.pincode}, {order.customer.phone}</span>
                            {/* Duplicate phone in address block as per image "670674, 8848291320" */}
                        </div>
                    </div>
                </div>

                {/* Footer / Order Number */}
                <div className="mt-8 px-2 pt-4 border-t-0 text-sm font-bold flex">
                    <span className="w-40 shrink-0">Order Number -</span>
                    <span>{order._id.toString()}</span>
                    {/* Note: The image shows a shorter number "12204640", but MongoDB IDs are long strings. 
              The user might want a shorter ID, but for now I'll use the ID I have. 
              If there's a separate orderId field, I should use that. 
              Based on previous read, only _id was visible in headers. 
          */}
                </div>
            </div>
        </>
    );
};

export default PrintOrderReceipt;
