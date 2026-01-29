import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    slug: string;
    description?: string;
    price: number;
    discountPrice?: number;
    puffCount?: number;
    stock: number;
    category: mongoose.Types.ObjectId; // Reference to Category
    brand?: mongoose.Types.ObjectId;   // Reference to Brand
    images: string[];
    isHot: boolean; // For "Hot" badge
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String },
        price: { type: Number, required: true, min: 0 },
        discountPrice: { type: Number, min: 0 },
        puffCount: { type: Number },
        stock: { type: Number, required: true, default: 0 },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
        images: [{ type: String }],
        isHot: { type: Boolean, default: false },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    },
    { timestamps: true }
);

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
