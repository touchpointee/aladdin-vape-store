"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Brand {
    _id: string;
    name: string;
    logo: string;
}

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchBrands = async () => {
        try {
            const res = await fetch('/api/admin/brands');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch brands');
            setBrands(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load brands', error);
            setBrands([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleEdit = (brand: Brand) => {
        setEditingId(brand._id);
        setFormData({
            name: brand.name,
        });
        setPreviewImage(brand.logo);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return alert('Name is required');

        const data = new FormData();
        if (editingId) data.append('_id', editingId);
        data.append('name', formData.name);
        if (imageFile) {
            data.append('logo', imageFile);
        }

        try {
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch('/api/admin/brands', {
                method: method,
                body: data,
            });
            if (res.ok) {
                alert(editingId ? 'Brand Updated!' : 'Brand Created!');
                setFormData({ name: '' });
                setImageFile(null);
                setEditingId(null);
                fetchBrands(); // Refresh list
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) {
            alert('Failed to save brand');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this brand?')) return;
        try {
            const res = await fetch(`/api/admin/brands?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Brand Deleted!');
                fetchBrands();
            } else {
                alert('Failed to delete brand');
            }
        } catch (error) {
            alert('Error deleting brand');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Brand Management</h1>

            {/* Create Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{editingId ? 'Edit Brand' : 'Add New Brand'}</h2>
                    {editingId && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ name: '' });
                                setImageFile(null);
                            }}
                            className="text-sm text-red-500 underline"
                        >
                            Cancel Edit
                        </button>
                    )}
                </div>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Brand Logo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="w-full"
                        />
                        {previewImage && !imageFile && (
                            <div className="mt-2 text-sm text-gray-500">
                                <p>Current Logo:</p>
                                <div className="relative w-20 h-20 rounded border overflow-hidden mt-1">
                                    <Image src={previewImage} alt="Current Logo" fill className="object-cover" unoptimized />
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">
                            {editingId ? 'Update Brand' : 'Create Brand'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium">Logo</th>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr>
                        ) : brands.map((brand) => (
                            <tr key={brand._id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    {brand.logo && (
                                        <div className="relative w-12 h-12 rounded overflow-hidden">
                                            <Image src={brand.logo} alt={brand.name} fill className="object-cover" unoptimized />
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 font-medium">{brand.name}</td>
                                <td className="p-4 flex gap-3">
                                    <button onClick={() => handleEdit(brand)} className="text-blue-600 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(brand._id)} className="text-red-500 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {!loading && brands.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">No brands found. Add one above.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
