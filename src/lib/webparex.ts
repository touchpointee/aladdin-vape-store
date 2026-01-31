import { IOrder } from "@/models/all";

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
            name: item.product?.name || "Product",
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
