"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Plus, X, Trash2 } from "lucide-react";

interface Product {
    _id: string;
    name: string;
    price: number;
    stock: number;
    category?: { _id: string; name: string } | null;
    brand?: { _id: string; name: string } | null;
    images: string[];
    isHot?: boolean;
    isTopSelling?: boolean;
    isNewArrival?: boolean;
    status?: 'active' | 'inactive';
    discountPrice?: number;
    description?: string;
    puffCount?: number;
    capacity?: string;
    resistance?: string;
    flavours?: string[];
    variants?: {
        nicotine: string;
        price: number;
        discountPrice?: number;
        stock: number;
    }[];
}

interface Option {
    _id: string;
    name: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Option[]>([]);
    const [brands, setBrands] = useState<Option[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        discountPrice: '',
        stock: '',
        puffCount: '',
        capacity: '',
        resistance: '',
        category: '',
        brand: '',
        description: '',
        isHot: false,
        isTopSelling: false,
        isNewArrival: false,
        status: 'active',
        flavours: [] as string[],
        variants: [] as { nicotine: string; price: string; discountPrice: string; stock: string }[],
        pricingMode: "single" as "single" | "variant", // Added pricingMode
    });
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, catRes, brandRes] = await Promise.all([
                fetch('/api/admin/products'),
                fetch('/api/admin/categories'),
                fetch('/api/admin/brands')
            ]);
            setProducts(await prodRes.json());
            setCategories(await catRes.json());
            setBrands(await brandRes.json());
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingId(product._id);
        const hasVariants = product.variants && product.variants.length > 0;
        setFormData({
            name: product.name,
            price: product.price?.toString() || '', // Ensure price is string
            discountPrice: product.discountPrice?.toString() || '',
            stock: product.stock?.toString() || '', // Ensure stock is string
            puffCount: product.puffCount?.toString() || '',
            capacity: product.capacity || '',
            resistance: product.resistance || '',
            category: product.category?._id || '',
            brand: product.brand?._id || '',
            description: product.description || '',
            isHot: product.isHot || false,
            isTopSelling: product.isTopSelling || false,
            isNewArrival: product.isNewArrival || false,
            status: product.status || 'active',
            flavours: product.flavours || [],
            variants: (product.variants || []).map(v => ({
                nicotine: v.nicotine,
                price: v.price.toString(),
                discountPrice: v.discountPrice?.toString() || '',
                stock: v.stock.toString()
            })),
            pricingMode: hasVariants ? "variant" : "single", // Set pricingMode based on variants
        });
        setExistingImages(product.images || []);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.category) return alert('Missing required fields');

        // Validate pricing based on mode
        if (formData.pricingMode === 'single') {
            if (!formData.price || !formData.stock) return alert('Price and Stock are required for single pricing mode.');
        } else { // variant mode
            if (formData.variants.length === 0) return alert('At least one variant is required for variant pricing mode.');
            for (const variant of formData.variants) {
                if (!variant.nicotine || !variant.price || !variant.stock) {
                    return alert('All variant fields (nicotine, price, stock) are required.');
                }
            }
        }

        const data = new FormData();
        if (editingId) data.append('_id', editingId);

        Object.entries(formData).forEach(([key, value]) => {
            if (key === 'flavours') {
                (value as string[]).forEach(f => data.append('flavours', f));
            } else if (key === 'variants') {
                // Only append variants if pricingMode is 'variant'
                if (formData.pricingMode === 'variant') {
                    data.append('variants', JSON.stringify(value));
                }
            } else if (key === 'price' || key === 'discountPrice' || key === 'stock') {
                // Only append single price/stock if pricingMode is 'single'
                if (formData.pricingMode === 'single') {
                    data.append(key, value.toString());
                }
            } else if (key !== 'pricingMode') { // Don't send pricingMode to backend
                data.append(key, value.toString());
            }
        });

        // Append existing images (for deletion/reordering context)
        existingImages.forEach(img => data.append('existingImages', img));

        imageFiles.forEach((file, index) => {
            data.append(`images[${index}]`, file);
        });

        try {
            const url = editingId ? '/api/admin/products' : '/api/admin/products'; // Same route, different method
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                body: data,
            });

            if (res.ok) {
                alert(editingId ? 'Product Updated!' : 'Product Created!');
                setShowForm(false);
                setEditingId(null); // Reset edit mode
                setFormData({
                    name: '', price: '', discountPrice: '', stock: '', puffCount: '', capacity: '', resistance: '', category: '', brand: '', description: '', isHot: false, isTopSelling: false, isNewArrival: false, status: 'active',
                    flavours: [], variants: [], pricingMode: 'single' // Reset pricingMode
                });
                setImageFiles([]);
                setExistingImages([]);
                fetchData();
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) {
            alert('Failed to save product');
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            const data = new FormData();
            data.append('_id', id);
            data.append('status', newStatus);

            const res = await fetch('/api/admin/products', {
                method: 'PUT',
                body: data,
            });

            if (res.ok) {
                setProducts(products.map(p => p._id === id ? { ...p, status: newStatus as any } : p));
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            alert('Error updating status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Product Deleted!');
                fetchData();
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            alert('Error deleting product');
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [stockFilter, setStockFilter] = useState<'all' | 'out' | 'low'>('all');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, stockFilter, selectedCategory, selectedBrand]);

    // Available brands based on selected category in FILTER BAR
    const filteredBrandsForFilter = useMemo(() => {
        if (!selectedCategory) return brands;
        // Find brands that have products in the selected category
        const brandIdsInCategory = new Set(
            products
                .filter(p => p.category?._id === selectedCategory)
                .map(p => p.brand?._id)
                .filter(Boolean)
        );
        return brands.filter(b => brandIdsInCategory.has(b._id));
    }, [brands, products, selectedCategory]);

    // Available brands based on selected category in FORM
    const filteredBrandsForForm = useMemo(() => {
        if (!formData.category) return brands;
        // Same logic but for the form's category selection
        const brandIdsInCategory = new Set(
            products
                .filter(p => p.category?._id === formData.category)
                .map(p => p.brand?._id)
                .filter(Boolean)
        );
        const filtered = brands.filter(b => brandIdsInCategory.has(b._id));
        // If current brand exists but isn't in filtered list, it might be a new assignment,
        // so we should probably still allow all brands in the form IF no products exist yet.
        // But for consistency with the user request, let's keep it filtered.
        return filtered.length > 0 ? filtered : brands;
    }, [brands, products, formData.category]);

    // Reset brand filter if not applicable to new category
    useEffect(() => {
        if (selectedBrand && !filteredBrandsForFilter.find(b => b._id === selectedBrand)) {
            setSelectedBrand('');
        }
    }, [selectedCategory, filteredBrandsForFilter, selectedBrand]);

    // Calculate stock levels
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 5).length;

    // Filtered Products
    const filteredProducts = products.filter(product => {
        const query = searchQuery.toLowerCase();

        // Search filter
        const matchesSearch = product.name.toLowerCase().includes(query) ||
            product.category?.name.toLowerCase().includes(query) ||
            product.brand?.name.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        // Stock filter
        if (stockFilter === 'out' && product.stock !== 0) return false;
        if (stockFilter === 'low' && (product.stock === 0 || product.stock >= 5)) return false;

        // Category filter
        if (selectedCategory && product.category?._id !== selectedCategory) return false;

        // Brand filter
        if (selectedBrand && product.brand?._id !== selectedBrand) return false;

        return true;
    });

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const isFiltered = searchQuery !== '' || stockFilter !== 'all' || selectedCategory !== '' || selectedBrand !== '';

    const handleClearFilters = () => {
        setSearchQuery('');
        setStockFilter('all');
        setSelectedCategory('');
        setSelectedBrand('');
        setCurrentPage(1);
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
                    <p className="text-sm text-gray-500">Manage your product inventory and attributes</p>
                </div>
                <button
                    onClick={() => {
                        setShowForm(!showForm);
                        setEditingId(null);
                        if (!showForm) {
                            setFormData({
                                name: '', price: '', discountPrice: '', stock: '', puffCount: '', capacity: '', resistance: '', category: '', brand: '', description: '', isHot: false, isTopSelling: false, isNewArrival: false, status: 'active',
                                flavours: [], variants: [], pricingMode: 'single' // Reset pricingMode
                            });
                            setExistingImages([]);
                        }
                    }}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 w-full md:w-auto shadow-lg hover:bg-blue-700 active:scale-95 transition-all text-sm font-bold uppercase"
                >
                    <Plus size={20} /> {showForm ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Stock Filters */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-start">
                        <button
                            onClick={() => setStockFilter('all')}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${stockFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All ({products.length})
                        </button>
                        <button
                            onClick={() => setStockFilter('out')}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${stockFilter === 'out' ? 'bg-red-600 text-white shadow-sm' : 'text-red-500 hover:bg-red-50'}`}
                        >
                            Out of Stock ({outOfStockCount})
                        </button>
                        <button
                            onClick={() => setStockFilter('low')}
                            className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-md transition-all ${stockFilter === 'low' ? 'bg-orange-500 text-white shadow-sm' : 'text-orange-500 hover:bg-orange-50'}`}
                        >
                            Low Stock ({lowStockCount})
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 flex-1 lg:max-w-3xl">
                        {/* Search Bar */}
                        <div className="relative flex-1 w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="pl-9 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Category & Brand Filters */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="text-xs font-bold border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full sm:w-40"
                            >
                                <option value="">All Categories</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                            <select
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="text-xs font-bold border rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full sm:w-40"
                            >
                                <option value="">{selectedCategory ? 'Filter Brand' : 'All Brands'}</option>
                                {filteredBrandsForFilter.map((brand) => (
                                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>

                        {isFiltered && (
                            <button
                                onClick={handleClearFilters}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 whitespace-nowrap"
                            >
                                <X size={14} /> Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-blue-100">
                    <h2 className="text-lg font-semibold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">

                        {/* Basic Info */}
                        <div className="mt-2"><h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Basic Info</h3></div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Name *</label>
                            <input type="text" className="w-full border p-2 rounded" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>

                        {/* Pricing Mode Selection */}
                        <div className="mt-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pricing Strategy</label>
                            <div className="flex p-1 bg-gray-100 rounded-lg w-fit">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, pricingMode: 'single' })}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${formData.pricingMode === 'single'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Single Price (Default)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setFormData({
                                            ...formData,
                                            pricingMode: 'variant',
                                            variants: formData.variants.length > 0 ? formData.variants : [{ nicotine: '', price: '', discountPrice: '', stock: '' }]
                                        });
                                    }}
                                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${formData.pricingMode === 'variant'
                                        ? 'bg-white text-purple-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Multiple Variants (Nicotine/Sizes)
                                </button>
                            </div>
                        </div>

                        {formData.pricingMode === 'single' ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                                <div className="md:col-span-3">
                                    <h3 className="text-[10px] font-bold text-blue-500 uppercase">Standard Pricing</h3>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Base Price (INR) *</label>
                                    <input type="number" className="w-full border p-2 rounded-lg" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Discount Price (Optional)</label>
                                    <input type="number" className="w-full border p-2 rounded-lg" value={formData.discountPrice} onChange={e => setFormData({ ...formData, discountPrice: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Total Stock *</label>
                                    <input type="number" className="w-full border p-2 rounded-lg" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                </div>
                            </div>
                        ) : (
                            /* Nicotine Variants Section */
                            <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100">
                                <h3 className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Plus size={14} /> Nicotine/Capacity Variants
                                </h3>
                                <div className="space-y-4 mb-4">
                                    {formData.variants.map((v, i) => (
                                        <div key={i} className="relative p-4 rounded-xl bg-white border border-purple-100 shadow-sm space-y-3">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, variants: formData.variants.filter((_, idx) => idx !== i) })}
                                                className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition shadow-sm z-10"
                                            >
                                                <Trash2 size={14} />
                                            </button>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Variant Name (e.g. 50mg / 10ml)</label>
                                                    <input
                                                        type="text"
                                                        className="w-full border p-2 rounded-lg text-sm bg-gray-50"
                                                        value={v.nicotine}
                                                        placeholder="e.g. 20mg Nicotine"
                                                        onChange={(e) => {
                                                            const newVariants = [...formData.variants];
                                                            newVariants[i].nicotine = e.target.value;
                                                            setFormData({ ...formData, variants: newVariants });
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Price</label>
                                                    <input
                                                        type="number"
                                                        className="w-full border p-2 rounded-lg text-sm bg-gray-50"
                                                        value={v.price}
                                                        onChange={(e) => {
                                                            const newVariants = [...formData.variants];
                                                            newVariants[i].price = e.target.value;
                                                            setFormData({ ...formData, variants: newVariants });
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Discount Price</label>
                                                    <input
                                                        type="number"
                                                        className="w-full border p-2 rounded-lg text-sm bg-gray-50"
                                                        value={v.discountPrice}
                                                        onChange={(e) => {
                                                            const newVariants = [...formData.variants];
                                                            newVariants[i].discountPrice = e.target.value;
                                                            setFormData({ ...formData, variants: newVariants });
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="block text-[10px] uppercase text-gray-400 font-bold mb-1">Stock Level</label>
                                                    <input
                                                        type="number"
                                                        className="w-full border p-2 rounded-lg text-sm bg-gray-50"
                                                        value={v.stock}
                                                        onChange={(e) => {
                                                            const newVariants = [...formData.variants];
                                                            newVariants[i].stock = e.target.value;
                                                            setFormData({ ...formData, variants: newVariants });
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, variants: [...formData.variants, { nicotine: '', price: '', discountPrice: '', stock: '' }] })}
                                    className="w-full border-2 border-dashed border-purple-200 p-3 rounded-lg text-purple-400 hover:border-purple-400 hover:text-purple-600 transition-all font-bold text-sm uppercase flex items-center justify-center gap-2"
                                >
                                    <Plus size={16} /> Add Another Variant
                                </button>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Puff Count</label>
                                <input type="number" className="w-full border p-2 rounded" value={formData.puffCount} onChange={e => setFormData({ ...formData, puffCount: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Capacity</label>
                                <input type="text" className="w-full border p-2 rounded" value={formData.capacity} placeholder="e.g. 10ml" onChange={e => setFormData({ ...formData, capacity: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Resistance</label>
                                <input type="text" className="w-full border p-2 rounded" value={formData.resistance} placeholder="e.g. 0.8ohm" onChange={e => setFormData({ ...formData, resistance: e.target.value })} />
                            </div>
                        </div>

                        {/* Flavours Section */}
                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Plus size={14} /> Flavours
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {formData.flavours.map((f, i) => (
                                    <div key={i} className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-blue-200">
                                        <span className="text-sm font-medium">{f}</span>
                                        <button type="button" onClick={() => setFormData({ ...formData, flavours: formData.flavours.filter((_, idx) => idx !== i) })} className="text-red-500 hover:text-red-700">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="new-flavour"
                                    placeholder="Add flavour (e.g. Mint)"
                                    className="flex-1 border p-2 rounded text-sm bg-white"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = (e.target as HTMLInputElement).value.trim();
                                            if (val && !formData.flavours.includes(val)) {
                                                setFormData({ ...formData, flavours: [...formData.flavours, val] });
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.getElementById('new-flavour') as HTMLInputElement;
                                        const val = input.value.trim();
                                        if (val && !formData.flavours.includes(val)) {
                                            setFormData({ ...formData, flavours: [...formData.flavours, val] });
                                            input.value = '';
                                        }
                                    }}
                                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold shadow-sm"
                                >
                                    Add
                                </button>
                            </div>
                        </div>



                        {/* Relations */}
                        <div className="mt-4"><h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Organization</h3></div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Category *</label>
                            <select className="w-full border p-2 rounded" required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Brand</label>
                            <select className="w-full border p-2 rounded" value={formData.brand} onChange={e => setFormData({ ...formData, brand: e.target.value })}>
                                <option value="">Select Brand</option>
                                {filteredBrandsForForm.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>

                        {/* Details */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea className="w-full border p-2 rounded h-24" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>



                        <div className="flex flex-wrap gap-6 mt-2">
                            <label className="flex items-center gap-2 cursor-pointer bg-red-50 p-2 rounded border border-red-100 pr-4">
                                <input type="checkbox" checked={formData.isHot} onChange={e => setFormData({ ...formData, isHot: e.target.checked })} className="w-5 h-5 text-red-600 rounded" />
                                <span className="font-bold text-red-600 text-sm uppercase">Mark as HOT Product</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer bg-blue-50 p-2 rounded border border-blue-100 pr-4">
                                <input type="checkbox" checked={formData.isTopSelling} onChange={e => setFormData({ ...formData, isTopSelling: e.target.checked })} className="w-5 h-5 text-blue-600 rounded" />
                                <span className="font-bold text-blue-600 text-sm uppercase">Mark as Top Selling</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer bg-green-50 p-2 rounded border border-green-100 pr-4">
                                <input type="checkbox" checked={formData.isNewArrival} onChange={e => setFormData({ ...formData, isNewArrival: e.target.checked })} className="w-5 h-5 text-green-600 rounded" />
                                <span className="font-bold text-green-600 text-sm uppercase">Mark as New Arrival</span>
                            </label>
                        </div>

                        {/* Images */}
                        <div className="mt-2">
                            <label className="block text-sm font-medium mb-1">Current Images (Manage)</label>
                            {existingImages.length > 0 ? (
                                <div className="flex flex-wrap gap-4 mb-4">
                                    {existingImages.map((img, index) => (
                                        <div key={index} className="relative w-24 h-24 border rounded overflow-hidden group">
                                            <Image src={img} alt="Product" fill className="object-cover" unoptimized />
                                            <button
                                                type="button"
                                                onClick={() => setExistingImages(existingImages.filter((_, i) => i !== index))}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-sm italic mb-2">No existing images.</p>
                            )}

                            <label className="block text-sm font-medium mb-1">Add New Images</label>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                                className="w-full"
                            />
                        </div>

                        <div className="mt-4">
                            <button type="submit" className="w-full bg-green-600 text-white px-6 py-3 rounded font-bold hover:bg-green-700">
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-medium">Image</th>
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Category</th>
                                <th className="p-4 font-medium">Price</th>
                                <th className="p-4 font-medium">Stock</th>
                                <th className="p-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
                            ) : paginatedProducts.map((prod) => (
                                <tr key={prod._id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        {prod.images?.[0] && (
                                            <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                                <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" unoptimized />
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium">
                                        <div className="line-clamp-2 w-48 md:w-64 whitespace-normal font-bold text-gray-900" title={prod.name}>
                                            {prod.name}
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {prod.flavours && prod.flavours.length > 0 && (
                                                <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-black uppercase">
                                                    {prod.flavours.length} Flavours
                                                </span>
                                            )}
                                            {prod.variants && prod.variants.length > 0 && (
                                                <span className="text-[9px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded border border-purple-100 font-black uppercase">
                                                    {prod.variants.length} Variants
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500 font-medium">
                                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">{prod.category?.name || 'Uncategorized'}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {(() => {
                                                const hasVariants = prod.variants && prod.variants.length > 0;
                                                if (hasVariants) {
                                                    const prices = prod.variants!.map(v => v.price);
                                                    const minPrice = Math.min(...prices);
                                                    const maxPrice = Math.max(...prices);
                                                    return (
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] text-purple-600 font-black uppercase">Variant Pricing</span>
                                                            <span className="font-bold text-gray-900">
                                                                {minPrice === maxPrice ? `${minPrice} INR` : `${minPrice} - ${maxPrice} INR`}
                                                            </span>
                                                        </div>
                                                    );
                                                }

                                                if (prod.discountPrice && prod.discountPrice < prod.price) {
                                                    return (
                                                        <>
                                                            <span className="font-bold text-red-600">{prod.discountPrice} INR</span>
                                                            <span className="text-xs text-gray-400 line-through">{prod.price} INR</span>
                                                        </>
                                                    );
                                                }
                                                return <span className="font-bold text-gray-900">{prod.price || 0} INR</span>;
                                            })()}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {(() => {
                                            const hasVariants = prod.variants && prod.variants.length > 0;
                                            const totalStock = hasVariants
                                                ? prod.variants!.reduce((acc, v) => acc + v.stock, 0)
                                                : (prod.stock || 0);

                                            return (
                                                <div className="flex flex-col">
                                                    <span className={`font-black ${totalStock < 5 ? 'text-red-500' : 'text-green-600'}`}>
                                                        {totalStock}
                                                    </span>
                                                    {hasVariants && <span className="text-[9px] text-gray-400 uppercase font-bold">Total Stock</span>}
                                                </div>
                                            );
                                        })()}
                                    </td>
                                    <td className="p-4 flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(prod._id, prod.status || 'active')}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${prod.status === 'inactive' ? 'bg-gray-200' : 'bg-green-500'}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prod.status === 'inactive' ? 'translate-x-1' : 'translate-x-6'}`}
                                                />
                                            </button>
                                            <span className="text-[10px] font-bold uppercase text-gray-400">
                                                {prod.status === 'inactive' ? 'Hidden' : 'Live'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(prod)} className="text-blue-600 hover:underline">Edit</button>
                                            <button onClick={() => handleDelete(prod._id)} className="text-red-500 hover:underline">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredProducts.length === 0 && (
                                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No products found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 px-4 py-3 bg-white border rounded-lg shadow-sm">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)}</span> of <span className="font-bold">{filteredProducts.length}</span> products
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:bg-gray-50 hover:bg-gray-50 transition-colors"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 flex items-center justify-center rounded-md text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 border'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border rounded-md text-sm font-medium disabled:opacity-50 disabled:bg-gray-50 hover:bg-gray-50 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
