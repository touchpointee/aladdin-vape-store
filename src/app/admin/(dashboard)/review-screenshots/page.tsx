"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface ScreenshotItem {
  url: string;
  caption?: string;
  order?: number;
}

export default function AdminReviewScreenshotsPage() {
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchScreenshots = async () => {
    try {
      const res = await fetch("/api/admin/review-screenshots");
      const data = await res.json();
      if (res.ok) setScreenshots(data.screenshots || []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => {
    fetchScreenshots();
  }, []);

  const saveScreenshots = async (list: ScreenshotItem[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/review-screenshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshots: list }),
      });
      if (res.ok) {
        const data = await res.json();
        setScreenshots(data.screenshots || []);
      }
    } catch (_) {}
    setSaving(false);
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      let list = [...screenshots];
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data?.url) {
          list = [...list, { url: data.url, caption: "", order: list.length }];
        }
      }
      if (list.length > screenshots.length) await saveScreenshots(list);
    } catch (_) {}
    setUploading(false);
    e.target.value = "";
  };

  const remove = (index: number) => {
    const list = screenshots.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i }));
    saveScreenshots(list);
  };

  const move = (index: number, dir: 1 | -1) => {
    const next = index + dir;
    if (next < 0 || next >= screenshots.length) return;
    const list = [...screenshots];
    [list[index], list[next]] = [list[next], list[index]];
    const reordered = list.map((s, i) => ({ ...s, order: i }));
    saveScreenshots(reordered);
  };

  const updateCaption = (index: number, caption: string) => {
    setScreenshots((prev) => prev.map((s, i) => (i === index ? { ...s, caption } : s)));
  };

  const saveCaption = (index: number, caption: string) => {
    const list = screenshots.map((s, i) => (i === index ? { ...s, caption } : s));
    saveScreenshots(list);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Customer Review Screenshots</h1>
      <p className="text-gray-500 text-sm mb-6">
        These images appear in the &quot;Customer Reviews&quot; section on the home page (website and app). Upload screenshots of reviews; they will be shown in a scrollable strip.
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onUpload}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        <Upload size={18} />
        {uploading ? "Uploading..." : "Upload screenshot(s)"}
      </button>

      {saving && <p className="text-sm text-amber-600 mb-2">Saving...</p>}

      <div className="space-y-4">
        {screenshots.length === 0 && (
          <p className="text-gray-400">No screenshots yet. Upload one to show in the Customer Reviews section.</p>
        )}
        {screenshots.map((s, index) => (
          <div
            key={`${s.url}-${index}`}
            className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg"
          >
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                title="Move up"
              >
                <ChevronUp size={20} />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === screenshots.length - 1}
                className="p-1 text-gray-500 hover:text-gray-800 disabled:opacity-30"
                title="Move down"
              >
                <ChevronDown size={20} />
              </button>
            </div>
            <img src={s.url.startsWith("http") ? s.url : s.url} alt="" className="w-24 h-24 object-cover rounded border" />
            <div className="flex-1 min-w-0">
              <input
                type="text"
                placeholder="Caption (optional)"
                value={s.caption ?? ""}
                onChange={(e) => updateCaption(index, e.target.value)}
                onBlur={(e) => saveCaption(index, e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
