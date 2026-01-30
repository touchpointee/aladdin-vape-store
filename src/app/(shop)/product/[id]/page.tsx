import { Metadata, ResolvingMetadata } from 'next';
import connectDB from "@/lib/db";
import { Product, Settings } from "@/models/all";
import ProductDetailClient from "./ProductDetailClient";
import Script from "next/script";
import { notFound } from "next/navigation";

export const revalidate = 3600; // revalidate at most every hour

interface Props {
    params: Promise<{ id: string }>;
}

async function getProduct(idOrSlug: string) {
    await connectDB();

    // Try to find by ID first (Mongoose might throw error if not ObjectID format)
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        const product = await Product.findById(idOrSlug).populate("category").populate("brand");
        if (product) return product;
    }

    // Fallback to slug
    return await Product.findOne({ slug: idOrSlug, status: 'active' }).populate("category").populate("brand");
}

async function getSettings(key: string) {
    await connectDB();
    return await Settings.findOne({ key });
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = (await params).id;
    const product = await getProduct(id) as any;

    if (!product) {
        return {
            title: 'Product Not Found',
        };
    }

    const previousImages = (await parent).openGraph?.images || [];
    const productImage = product.images?.[0] || '/product-placeholder.png';

    const discountedPrice = (product.discountPrice && product.discountPrice < product.price)
        ? product.discountPrice
        : (product.discountPercent
            ? (product.price - (product.price * product.discountPercent / 100))
            : product.price);

    return {
        title: product.metaTitle || product.name,
        description: product.metaDescription || product.description?.substring(0, 160) || `Buy ${product.name} at Aladdin Vape Store. Best price: INR ${discountedPrice}`,
        alternates: {
            canonical: `/product/${product.slug || product._id}`
        },
        openGraph: {
            title: product.metaTitle || `${product.name} | Aladdin Vape Store`,
            description: product.metaDescription || product.description?.substring(0, 160),
            url: `https://aladdinvapestoreindia.com/product/${product.slug || product._id}`,
            images: [productImage, ...previousImages],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: product.metaTitle || product.name,
            description: product.metaDescription || product.description?.substring(0, 160),
            images: [productImage],
        },
    };
}

export default async function ProductDetailPage({ params }: Props) {
    const id = (await params).id;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    // Fetch WhatsApp number
    const whatsappSetting = await getSettings('whatsapp_number');
    const whatsappNumber = whatsappSetting?.value || "";

    const discountedPrice = (product.discountPrice && product.discountPrice < product.price)
        ? product.discountPrice
        : (product.discountPercent
            ? (product.price - (product.price * product.discountPercent / 100))
            : product.price);

    // JSON-LD Schema
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images?.map((img: string) => img.startsWith('http') ? img : `https://aladdinvapestoreindia.com${img}`),
        "description": product.description,
        "brand": {
            "@type": "Brand",
            "name": (product.brand as any)?.name || "Aladdin Vape"
        },
        "offers": {
            "@type": "Offer",
            "url": `https://aladdinvapestoreindia.com/product/${product.slug || product._id}`,
            "priceCurrency": "INR",
            "price": discountedPrice,
            "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "itemCondition": "https://schema.org/NewCondition"
        },
        "category": (product.category as any)?.name
    };

    return (
        <>
            <Script
                id="product-jsonld"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ProductDetailClient
                product={JSON.parse(JSON.stringify(product))}
                whatsappNumber={whatsappNumber}
            />
        </>
    );
}
