"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, X } from "lucide-react";

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
        setFormData({
            name: product.name,
            price: product.price.toString(),
            discountPrice: product.discountPrice?.toString() || '',
            stock: product.stock.toString(),
            puffCount: product.puffCount?.toString() || '',
            capacity: product.capacity || '',
            resistance: product.resistance || '',
            category: product.category?._id || '', // Safe access
            brand: product.brand?._id || '',       // Safe access
            description: product.description || '',
            isHot: product.isHot || false,
            isTopSelling: product.isTopSelling || false,
            isNewArrival: product.isNewArrival || false,
            status: product.status || 'active',
        });
        setExistingImages(product.images || []);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.category || !formData.price) return alert('Missing required fields');

        const data = new FormData();
        if (editingId) data.append('_id', editingId);

        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value.toString());
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
                    name: '', price: '', discountPrice: '', stock: '', puffCount: '', capacity: '', resistance: '', category: '', brand: '', description: '', isHot: false, isTopSelling: false, isNewArrival: false, status: 'active'
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

    // Filtered Products
    const filteredProducts = products.filter(product => {
        const query = searchQuery.toLowerCase();
        return (
            product.name.toLowerCase().includes(query) ||
            product.category?.name.toLowerCase().includes(query) ||
            product.brand?.name.toLowerCase().includes(query)
        );
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold">Product Management</h1>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => {
                            setShowForm(!showForm);
                            setEditingId(null);
                            if (!showForm) { // If opening, reset
                                setFormData({
                                    name: '', price: '', discountPrice: '', stock: '', puffCount: '', capacity: '', resistance: '', category: '', brand: '', description: '', isHot: false, isTopSelling: false, isNewArrival: false, status: 'active'
                                });
                                setExistingImages([]);
                            }
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus size={20} /> {showForm ? 'Cancel' : 'Add Product'}
                    </button>
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

                        {/* Pricing & Stock */}
                        <div className="mt-4"><h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Pricing & Inventory</h3></div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Price (INR) *</label>
                            <input type="number" className="w-full border p-2 rounded" required value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Discount Price</label>
                            <input type="number" className="w-full border p-2 rounded" value={formData.discountPrice} onChange={e => setFormData({ ...formData, discountPrice: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Stock *</label>
                            <input type="number" className="w-full border p-2 rounded" required value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                        </div>
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
                                {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
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
                                            <Image src={img} alt="Product" fill className="object-cover" />
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
                            ) : filteredProducts.map((prod) => (
                                <tr key={prod._id} className="hover:bg-gray-50">
                                    <td className="p-4">
                                        {prod.images?.[0] && (
                                            <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                                                <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 font-medium">
                                        <div className="line-clamp-2 w-48 md:w-64 whitespace-normal" title={prod.name}>
                                            {prod.name}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500">{prod.category?.name}</td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            {prod.discountPrice && prod.discountPrice < prod.price ? (
                                                <>
                                                    <span className="font-bold text-red-600">{prod.discountPrice} INR</span>
                                                    <span className="text-xs text-gray-400 line-through">{prod.price} INR</span>
                                                </>
                                            ) : (
                                                <span className="font-bold text-gray-900">{prod.price} INR</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className={`p-4 ${prod.stock < 5 ? 'text-red-500 font-bold' : 'text-green-600'}`}>
                                        {prod.stock}
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
        </div>
    );
}
