import { IOrder } from "@/models/unified";

export async function pushOrderToWebparex(order: IOrder, extraData: {
    state: string,
    warehouse_id: string,
    weight: number,
    length: number,
    width: number,
    height: number
}) {
    const publicKey = process.env.WEBPAREX_PUBLIC_KEY;
    const privateKey = process.env.WEBPAREX_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
        throw new Error("Webparex API keys are not configured");
    }

    const payload = {
        order_id: order._id.toString(),
        order_date: new Date(order.createdAt).toISOString().split('T')[0],
        order_type: "ESSENTIALS",
        consignee_name: order.customer.name,
        consignee_phone: Number(order.customer.phone.replace(/\D/g, '')),
        consignee_alternate_phone: Number(process.env.WEBPAREX_SECONDARY_PHONE?.replace(/\D/g, '') || "9999999999"),
        consignee_email: order.customer.email || "",
        consignee_address_line_one: order.customer.address,
        consignee_address_line_two: order.customer.landmark || "",
        consignee_pin_code: Number(order.customer.pincode.toString().replace(/\D/g, '')),
        consignee_city: order.customer.city,
        consignee_state: extraData.state,
        product_detail: order.products.map((item: any) => ({
            name: "Alladin Store Products",
            sku_number: item.product?._id.toString(),
            quantity: item.quantity,
            discount: "",
            hsn: "",
            unit_price: item.price,
            product_category: "Other"
        })),
        payment_type: order.paymentStatus === 'Paid' ? "PREPAID" : "COD",
        cod_amount: order.paymentStatus === 'Paid' ? "" : String(order.totalPrice),
        weight: extraData.weight,
        length: extraData.length,
        width: extraData.width,
        height: extraData.height,
        warehouse_id: extraData.warehouse_id,
        gst_ewaybill_number: "",
        gstin_number: ""
    };

    const response = await fetch("https://shipping-api.com/app/api/v1/push-order", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "public-key": publicKey,
            "private-key": privateKey
        },
        body: JSON.stringify(payload)
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        const text = await response.text();
        throw new Error(`Unexpected non-JSON response from Webparex: ${text.substring(0, 200)}`);
    }

    if (!response.ok) {
        throw new Error(data.message || `Webparex API error (${response.status}): ${JSON.stringify(data)}`);
    }

    return data;
}
export async function getWarehouses() {
    const publicKey = process.env.WEBPAREX_PUBLIC_KEY;
    const privateKey = process.env.WEBPAREX_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
        throw new Error("Webparex API keys are not configured");
    }

    const response = await fetch("https://shipping-api.com/app/api/v1/get-warehouses", {
        method: "GET",
        headers: {
            "public-key": publicKey,
            "private-key": privateKey
        }
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        const text = await response.text();
        throw new Error(`Unexpected non-JSON response from Webparex: ${text.substring(0, 200)}`);
    }

    if (!response.ok) {
        throw new Error(data.message || `Webparex API error (${response.status})`);
    }

    return data;
}

// Map courier status - handles various courier status formats dynamically
function mapCourierStatus(courierStatus: string): string | null {
    if (!courierStatus) return null;

    // Normalize the status (trim and lowercase for comparison)
    const normalized = courierStatus.trim().toLowerCase();

    // Map courier statuses to our internal statuses
    const statusMap: { [key: string]: string } = {
        // Pickup statuses
        'pickup pending': 'Pickup Pending',
        'pending pickup': 'Pickup Pending',
        'pickup_pending': 'Pickup Pending',
        'awaiting pickup': 'Pickup Pending',

        'pickup scheduled': 'Pickup Scheduled',
        'scheduled': 'Pickup Scheduled',
        'pickup_scheduled': 'Pickup Scheduled',

        'picked up': 'Picked Up',
        'picked_up': 'Picked Up',
        'pickup done': 'Picked Up',
        'picked': 'Picked Up',
        'manifested': 'Picked Up',

        // Transit statuses
        'in transit': 'In Transit',
        'in_transit': 'In Transit',
        'intransit': 'In Transit',
        'transit': 'In Transit',
        'in-transit': 'In Transit',
        'shipped': 'In Transit',
        'dispatched': 'In Transit',

        // Out for delivery
        'out for delivery': 'Out For Delivery',
        'out_for_delivery': 'Out For Delivery',
        'outfordelivery': 'Out For Delivery',
        'out-for-delivery': 'Out For Delivery',
        'ofd': 'Out For Delivery',

        // Delivered
        'delivered': 'Delivered',
        'delivery': 'Delivered',
        'completed': 'Delivered',

        // Packed (manual status)
        'packed': 'Packed',
        'ready to ship': 'Packed',
        'ready_to_ship': 'Packed',
    };

    // Check if we have a direct mapping
    if (statusMap[normalized]) {
        return statusMap[normalized];
    }

    // If no exact match, try to find partial matches
    if (normalized.includes('pickup') && normalized.includes('pending')) {
        return 'Pickup Pending';
    }
    if (normalized.includes('pickup') && normalized.includes('scheduled')) {
        return 'Pickup Scheduled';
    }
    if (normalized.includes('picked')) {
        return 'Picked Up';
    }
    if (normalized.includes('transit')) {
        return 'In Transit';
    }
    if (normalized.includes('out') && normalized.includes('delivery')) {
        return 'Out For Delivery';
    }
    if (normalized.includes('delivered')) {
        return 'Delivered';
    }
    if (normalized.includes('packed')) {
        return 'Packed';
    }

    // If we still can't map it, log it and return null
    console.warn(`Unknown courier status received: "${courierStatus}". Please add mapping.`);
    return null;
}


export async function trackOrder(awbNumber: string) {
    const publicKey = process.env.WEBPAREX_PUBLIC_KEY;
    const privateKey = process.env.WEBPAREX_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
        throw new Error("Webparex API keys are not configured");
    }

    const response = await fetch(`https://shipping-api.com/app/api/v1/track-order?awb_number=${awbNumber}`, {
        method: "GET",
        headers: {
            "public-key": publicKey,
            "private-key": privateKey
        }
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        data = await response.json();
    } else {
        const text = await response.text();
        throw new Error(`Unexpected non-JSON response from Webparex: ${text.substring(0, 200)}`);
    }

    if (!response.ok || data.result !== "1") {
        throw new Error(data.message || `Webparex tracking API error (${response.status})`);
    }

    // Map courier status to our status
    const mappedStatus = mapCourierStatus(data.data?.current_status);

    return {
        ...data,
        mappedStatus,
        awbNumber: data.data?.awb_number,
        currentStatus: data.data?.current_status,
        expectedDelivery: data.data?.expected_delivery_date,
        courier: data.data?.courier
    };
}
