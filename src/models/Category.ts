import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    image?: string;
    description?: string;
    status: 'active' | 'inactive';
    slug?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
    {
        name: { type: String, required: true, trim: true },
        image: { type: String }, // Store MinIO URL
        description: { type: String },
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        slug: { type: String, unique: true, sparse: true, trim: true },
    },
    { timestamps: true }
);

// Pre-save hook for slug generation
CategorySchema.pre('save', function (this: any) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
});

// Prevent overwrite on hot reload
const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
