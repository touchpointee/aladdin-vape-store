import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Interfaces ---

export interface ICategory extends Document {
    name: string;
    description?: string;
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
    /** From reviews API: average of approved reviews (not stored on product doc) */
    averageRating?: number | null;
    /** From reviews API: count of approved reviews (not stored on product doc) */
    reviewCount?: number;
    flavours?: string[];
    variants?: {
        nicotine: string;
        price: number;
        discountPrice?: number;
        stock: number;
    }[];
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
        state: string;
        pincode: string;
        age: number;
    };
    products: {
        product: mongoose.Types.ObjectId | IProduct;
        quantity: number;
        price: number;
        flavour?: string;
        nicotine?: string;
    }[];
    totalPrice: number;
    paymentMode: 'COD' | 'PREPAID';
    paymentStatus: 'COD' | 'Paid' | 'pending_verification' | 'verified' | 'failed';
    utrNumber?: string;
    status: string;
    orderType: 'website' | 'whatsapp';
    shipmentStatus: 'Pending' | 'Created' | 'Failed';
    shipmentResponse?: any;
    shipmentOrderId?: string;
    awbNumber?: string;
    discount?: number;
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
    state: string;
    pincode: string;
    age: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IPushSubscription extends Document {
    subscription: any; // The full subscription object from browser
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IUTR extends Document {
    utr: string;
    orderId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IReview extends Document {
    product: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    authorName: string;
    authorPhone?: string;
    /** One review per customer per product: "guest:uuid" or "user:userId" */
    customerId?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

// --- Schemas ---

const CategorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true },
        description: { type: String },
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
        price: { type: Number },
        discountPrice: { type: Number },
        discountPercent: { type: Number, default: 0 },
        images: [{ type: String }],
        stock: { type: Number, default: 0 },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        slug: { type: String, unique: true, sparse: true, trim: true },
        metaTitle: { type: String, trim: true },
        metaDescription: { type: String, trim: true },
        isNewArrival: { type: Boolean, default: false },
        rating: { type: Number, default: 5 },
        flavours: [{ type: String }],
        variants: [{
            nicotine: { type: String, required: true },
            price: { type: Number, required: true },
            discountPrice: { type: Number },
            stock: { type: Number, required: true, default: 0 },
        }],
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
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            age: { type: Number, required: true },
        },
        products: [
            {
                product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true },
                flavour: { type: String },
                nicotine: { type: String },
            },
        ],
        totalPrice: { type: Number, required: true },
        paymentMode: { type: String, enum: ['COD', 'PREPAID'], default: 'COD' },
        paymentStatus: { type: String, enum: ['COD', 'Paid', 'pending_verification', 'verified', 'failed'], default: 'COD' },
        utrNumber: { type: String, trim: true },
        status: {
            type: String,
            default: 'Pending',
        },
        orderType: { type: String, enum: ['website', 'whatsapp'], default: 'website' },
        shipmentStatus: { type: String, enum: ['Pending', 'Created', 'Failed'], default: 'Pending' },
        shipmentResponse: { type: Schema.Types.Mixed },
        shipmentOrderId: { type: String },
        awbNumber: { type: String },
        discount: { type: Number, default: 0 },
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
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        age: { type: Number, required: true },
    },
    { timestamps: true }
);

const PushSubscriptionSchema = new Schema<IPushSubscription>(
    {
        subscription: { type: Schema.Types.Mixed, required: true },
        isAdmin: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const UTRSchema = new Schema<IUTR>(
    {
        utr: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        },
    },
    { timestamps: true }
);

// Index for fast lookup
UTRSchema.index({ utr: 1 });

const ReviewSchema = new Schema<IReview>(
    {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, default: '', trim: true },
        authorName: { type: String, default: 'Guest', trim: true },
        authorPhone: { type: String, trim: true },
        customerId: { type: String, trim: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    },
    { timestamps: true }
);
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ product: 1, customerId: 1 }, { unique: true, sparse: true });

// Force re-registration of Product if schema doesn't match new requirements (variants, optional price)
if (mongoose.models.Product && (
    !mongoose.models.Product.schema.path('variants') ||
    mongoose.models.Product.schema.path('price').isRequired
)) {
    delete mongoose.models.Product;
}

// Force re-registration of Order if schema doesn't have required fields or new flavour/nicotine paths
if (mongoose.models.Order && (
    !mongoose.models.Order.schema.path('paymentStatus') ||
    !mongoose.models.Order.schema.path('shipmentStatus') ||
    !mongoose.models.Order.schema.path('customer.state') ||
    !mongoose.models.Order.schema.path('utrNumber') ||
    !mongoose.models.Order.schema.path('products.flavour') ||
    !mongoose.models.Order.schema.path('products.nicotine') ||
    !mongoose.models.Order.schema.path('discount') ||
    // Force re-registration if status has enum (we want it to be a plain string)
    (mongoose.models.Order.schema.path('status') && (mongoose.models.Order.schema.path('status') as any).enumValues)
)) {
    delete mongoose.models.Order;
}

if (mongoose.models.Address && !mongoose.models.Address.schema.path('state')) {
    delete mongoose.models.Address;
}

if (mongoose.models.Review && (!mongoose.models.Review.schema.path('customerId') || !mongoose.models.Review.schema.path('status'))) {
    delete mongoose.models.Review;
}

// --- Models ---
// Check if models exist to prevent overwrite error during hot reload
export const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export const Brand: Model<IBrand> = mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);
export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
export const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
export const Address: Model<IAddress> = mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);
export const PushSubscription: Model<IPushSubscription> = mongoose.models.PushSubscription || mongoose.model<IPushSubscription>('PushSubscription', PushSubscriptionSchema);
export const UTR: Model<IUTR> = mongoose.models.UTR || mongoose.model<IUTR>('UTR', UTRSchema);
export const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
