"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface Category {
    _id: string;
    name: string;
    image: string;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch categories');
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load categories', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const handleEdit = (category: Category) => {
        setEditingId(category._id);
        setFormData({
            name: category.name,
            description: (category as any).description || '',
        });
        setPreviewImage(category.image);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name) return alert('Name is required');

        const data = new FormData();
        if (editingId) data.append('_id', editingId);
        data.append('name', formData.name);
        data.append('description', formData.description);
        if (imageFile) {
            data.append('image', imageFile);
        }

        try {
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch('/api/admin/categories', {
                method: method,
                body: data,
            });
            if (res.ok) {
                alert(editingId ? 'Category Updated!' : 'Category Created!');
                setFormData({ name: '', description: '' });
                setImageFile(null);
                setEditingId(null);
                fetchCategories(); // Refresh list
            } else {
                const err = await res.json();
                alert(err.error);
            }
        } catch (error) {
            alert('Failed to save category');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Category Deleted!');
                fetchCategories();
            } else {
                alert('Failed to delete category');
            }
        } catch (error) {
            alert('Error deleting category');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Category Management</h1>

            {/* Create Form */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
                    {editingId && (
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ name: '', description: '' });
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
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                            className="w-full border p-2 rounded"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Category Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="w-full"
                        />
                        {previewImage && !imageFile && (
                            <div className="mt-2 text-sm text-gray-500">
                                <p>Current Image:</p>
                                <div className="relative w-24 h-24 rounded border overflow-hidden mt-1">
                                    <Image src={previewImage} alt="Current Category" fill className="object-cover" />
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-medium hover:bg-blue-700">
                            {editingId ? 'Update Category' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium">Image</th>
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr>
                        ) : categories.map((cat) => (
                            <tr key={cat._id} className="hover:bg-gray-50">
                                <td className="p-4">
                                    {cat.image && (
                                        <div className="relative w-12 h-12 rounded overflow-hidden">
                                            <Image src={cat.image} alt={cat.name} fill className="object-cover" />
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 font-medium">{cat.name}</td>
                                <td className="p-4 flex gap-3">
                                    <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(cat._id)} className="text-red-500 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {!loading && categories.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-gray-500">No categories found. Add one above.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
