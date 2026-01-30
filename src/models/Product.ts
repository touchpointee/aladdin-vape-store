import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description?: string;
    price: number;
    discountPrice?: number;
    puffCount?: number;
    capacity?: string;
    resistance?: string;
    stock: number;
    category: mongoose.Types.ObjectId; // Reference to Category
    brand?: mongoose.Types.ObjectId;   // Reference to Brand
    images: string[];
    isHot: boolean; // For "Hot" badge
    isTopSelling: boolean;
    isNewArrival: boolean;
    status: 'active' | 'inactive';
    slug?: string;
    metaTitle?: string;
    metaDescription?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String },
        price: { type: Number, required: true, min: 0 },
        discountPrice: { type: Number, min: 0 },
        puffCount: { type: Number },
        capacity: { type: String },
        resistance: { type: String },
        stock: { type: Number, required: true, default: 0 },
        category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
        brand: { type: Schema.Types.ObjectId, ref: 'Brand' },
        images: [{ type: String }],
        isHot: { type: Boolean, default: false },
        isTopSelling: { type: Boolean, default: false },
        isNewArrival: { type: Boolean, default: false },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        slug: { type: String, unique: true, sparse: true, trim: true },
        metaTitle: { type: String, trim: true },
        metaDescription: { type: String, trim: true },
    },
    { timestamps: true }
);

// Pre-save hook for SEO automation
ProductSchema.pre('save', function (this: any) {
    // 1. Generate slug if it doesn't exist or name changed
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // remove non-word chars
            .replace(/\s+/g, '-')      // replace spaces with -
            .replace(/-+/g, '-')       // remove multiple -
            .trim();
    }

    // 2. Default Meta Title
    if (!this.metaTitle || (this.isModified('name') && this.metaTitle.includes('Aladdin Vape Store'))) {
        this.metaTitle = `${this.name} | Buy Online | Best Price in India | Aladdin Vape Store`;
    }

    // 3. Default Meta Description
    if (!this.metaDescription && this.description) {
        // Strip HTML if any (though currently it's just text) and truncate
        const plainDesc = this.description.replace(/<[^>]*>/g, '').substring(0, 155);
        this.metaDescription = plainDesc + (this.description.length > 155 ? '...' : '');
    }
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
