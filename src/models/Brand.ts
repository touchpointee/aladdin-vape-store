import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrand extends Document {
    name: string;
    logo?: string;
    status: 'active' | 'inactive';
    slug?: string;
    createdAt: Date;
    updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
    {
        name: { type: String, required: true, trim: true },
        logo: { type: String }, // Store MinIO URL
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        slug: { type: String, unique: true, sparse: true, trim: true },
    },
    { timestamps: true }
);

// Pre-save hook for slug generation
BrandSchema.pre('save', function (this: any) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
});

const Brand: Model<IBrand> = mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;
