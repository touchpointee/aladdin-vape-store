import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
    product: mongoose.Types.ObjectId;
    name: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    image: string;
}

export interface IOrder extends Document {
    orderId: string; // Friendly ID e.g. ORD-123456
    customer: {
        name: string;
        phone: string;
        address: string;
        city: string;
        zip: string;
    };
    items: IOrderItem[];
    totalPrice: number;
    paymentMethod: 'COD'; // Cash on Delivery only
    orderType: 'website' | 'whatsapp';
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
    {
        orderId: { type: String, required: true, unique: true },
        customer: {
            name: { type: String, required: true },
            phone: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            zip: { type: String, required: true },
        },
        items: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                originalPrice: { type: Number },
                quantity: { type: Number, required: true, min: 1 },
                image: { type: String, required: true },
            },
        ],
        totalPrice: { type: Number, required: true },
        paymentMethod: { type: String, default: 'COD' },
        orderType: { type: String, enum: ['website', 'whatsapp'], default: 'website' },
        status: {
            type: String,
            enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
