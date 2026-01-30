import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Interfaces ---

export interface ICategory extends Document {
    name: string;
    image: string;
    status: 'active' | 'inactive';
    slug?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IBrand extends Document {
    name: string;
    logo: string;
    status: 'active' | 'inactive';
    slug?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProduct extends Document {
    name: string;
    capacity?: string;
    resistance?: string;
    puffCount?: number;
    brand: mongoose.Types.ObjectId | IBrand;
    category: mongoose.Types.ObjectId | ICategory;
    description: string;
    price: number;
    discountPrice?: number;
    discountPercent?: number;
    images: string[];
    stock: number;
    status: 'active' | 'inactive';
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    isHot?: boolean;
    isTopSelling?: boolean;
    isNewArrival?: boolean;
    rating?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IOrder extends Document {
    customer: {
        name: string;
        phone: string;
        email: string;
        address: string;
        landmark?: string;
        city: string;
        pincode: string;
        age: number;
    };
    products: {
        product: mongoose.Types.ObjectId | IProduct;
        quantity: number;
        price: number;
    }[];
    totalPrice: number;
    paymentMode: 'COD';
    status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
    orderType: 'website' | 'whatsapp';
    createdAt: Date;
    updatedAt: Date;
}

export interface ISettings extends Document {
    key: string;
    value: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAddress extends Document {
    phone: string; // Linked to user by phone
    name: string;
    email: string;
    address: string;
    landmark?: string;
    city: string;
    pincode: string;
    age: number;
    createdAt: Date;
    updatedAt: Date;
}

// --- Schemas ---

const CategorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true },
        image: { type: String, required: true },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        slug: { type: String, unique: true, sparse: true, trim: true },
    },
    { timestamps: true }
);

CategorySchema.pre('save', function (this: any) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    }
});

const BrandSchema = new Schema<IBrand>(
    {
        name: { type: String, required: true },
        logo: { type: String, required: true },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        slug: { type: String, unique: true, sparse: true, trim: true },
    },
    { timestamps: true }
);

BrandSchema.pre('save', function (this: any) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    }
});

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        puffCount: { type: Number },
        capacity: { type: String },
        resistance: { type: String },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        discountPrice: { type: Number },
        discountPercent: { type: Number, default: 0 },
        images: [{ type: String }],
        stock: { type: Number, required: true, default: 0 },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        slug: { type: String, unique: true, sparse: true, trim: true },
        metaTitle: { type: String, trim: true },
        metaDescription: { type: String, trim: true },
        isHot: { type: Boolean, default: false },
        isTopSelling: { type: Boolean, default: false },
        isNewArrival: { type: Boolean, default: false },
        rating: { type: Number, default: 5 },
    },
    { timestamps: true }
);

ProductSchema.pre('save', function (this: any) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    }
    if (!this.metaTitle || (this.isModified('name') && this.metaTitle.includes('Aladdin Vape Store'))) {
        this.metaTitle = `${this.name} | Buy Online | Best Price in India | Aladdin Vape Store`;
    }
    if (!this.metaDescription && this.description) {
        const plainDesc = this.description.replace(/<[^>]*>/g, '').substring(0, 155);
        this.metaDescription = plainDesc + (this.description.length > 155 ? '...' : '');
    }
});

const OrderSchema = new Schema<IOrder>(
    {
        customer: {
            name: { type: String, required: true },
            phone: { type: String, required: true },
            email: { type: String, required: true },
            address: { type: String, required: true },
            landmark: { type: String },
            city: { type: String, required: true },
            pincode: { type: String, required: true },
            age: { type: Number, required: true },
        },
        products: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
            },
        ],
        totalPrice: { type: Number, required: true },
        paymentMode: { type: String, enum: ['COD'], default: 'COD' },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Delivered', 'Cancelled'],
            default: 'Pending',
        },
        orderType: { type: String, enum: ['website', 'whatsapp'], default: 'website' },
    },
    { timestamps: true }
);

const SettingsSchema = new Schema<ISettings>(
    {
        key: { type: String, required: true, unique: true },
        value: { type: String, required: true },
    },
    { timestamps: true }
);

const AddressSchema = new Schema<IAddress>(
    {
        phone: { type: String, required: true, index: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        landmark: { type: String },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        age: { type: Number, required: true },
    },
    { timestamps: true }
);

// --- Models ---
// Check if models exist to prevent overwrite error during hot reload
export const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export const Brand: Model<IBrand> = mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);
export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
export const Address: Model<IAddress> = mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);
