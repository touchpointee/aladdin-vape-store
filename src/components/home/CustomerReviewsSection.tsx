"use client";

import { useState, Fragment } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";

export interface ReviewScreenshotItem {
  url: string;
  caption?: string;
  order?: number;
}

interface CustomerReviewsSectionProps {
  screenshots: ReviewScreenshotItem[];
}

export default function CustomerReviewsSection({ screenshots }: CustomerReviewsSectionProps) {
  const [openUrl, setOpenUrl] = useState<string | null>(null);
  const openItem = openUrl ? screenshots.find((s) => s.url === openUrl) : null;

  if (!screenshots?.length) return null;

  return (
    <div className="mt-12 px-4 max-w-7xl mx-auto">
      <h3 className="text-xl font-black text-gray-900 uppercase mb-6 tracking-tight flex items-center gap-2">
        <span className="w-8 h-[2px] bg-blue-600"></span> Customer Reviews
      </h3>
      <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex items-stretch gap-4" style={{ minWidth: "min-content" }}>
          {screenshots.map((s, i) => (
            <Fragment key={`${s.url}-${i}`}>
              {i > 0 && (
                <div className="w-px flex-shrink-0 bg-gray-300 self-stretch min-h-[120px]" aria-hidden />
              )}
              <button
                type="button"
                onClick={() => setOpenUrl(s.url)}
                className="flex-shrink-0 w-[280px] md:w-[320px] text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
              >
                <div className="relative w-full h-[400px] md:h-[480px] rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm cursor-pointer hover:opacity-95 transition-opacity">
                  <Image
                    src={s.url}
                    alt={s.caption || "Customer review"}
                    fill
                    className="object-cover"
                    sizes="320px"
                    unoptimized
                  />
                </div>
                {s.caption && (
                  <p className="mt-2 text-sm text-gray-500 text-center line-clamp-2">{s.caption}</p>
                )}
              </button>
            </Fragment>
          ))}
        </div>
      </div>

      {openItem &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-4 cursor-default"
            onClick={() => setOpenUrl(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Review screenshot"
          >
            <button
              type="button"
              onClick={() => setOpenUrl(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            {/* Only the image area stops propagation so clicking the dark overlay closes */}
            <div
              className="relative flex-shrink-0 max-w-[90vw] max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
              role="presentation"
            >
              <img
                src={openItem.url}
                alt={openItem.caption || "Customer review"}
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl block"
              />
              {openItem.caption && (
                <p className="absolute bottom-0 left-0 right-0 py-2 px-4 text-sm text-white bg-black/60 rounded-b-lg text-center">
                  {openItem.caption}
                </p>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
