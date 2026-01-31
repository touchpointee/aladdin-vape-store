import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUTR extends Document {
    utr: string;
    orderId: mongoose.Types.ObjectId;
    createdAt: Date;
}

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

const UTR: Model<IUTR> = mongoose.models.UTR || mongoose.model<IUTR>('UTR', UTRSchema);

export default UTR;
