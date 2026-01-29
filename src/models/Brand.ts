import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrand extends Document {
    name: string;
    slug: string;
    logo?: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
    {
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        logo: { type: String }, // Store MinIO URL
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    },
    { timestamps: true }
);

const Brand: Model<IBrand> = mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);

export default Brand;
