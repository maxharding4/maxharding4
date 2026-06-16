"use client";

import { useState } from "react";
import Image from "next/image";
import { Asset } from "contentful";

interface PhotoGalleryProps {
  photos: Asset[];
  cityName: string;
}

// Photos wider than this ratio (e.g. 4464×1024 ≈ 4.36) are treated as
// panoramas: they break out of the grid onto their own full-width row
// rather than being cropped into a 4:3 thumbnail. 2.0 sits above a 16:9
// (1.78) landscape so ordinary wide shots stay in the grid.
const PANORAMIC_RATIO_THRESHOLD = 2;

export default function PhotoGallery({ photos, cityName }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Asset | null>(null);

  const getImageUrl = (photo: Asset): string | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (photo.fields as any)?.file?.url as string | undefined;
  };

  const getImageTitle = (photo: Asset): string => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((photo.fields as any)?.title as string) || cityName;
  };

  const getImageDimensions = (photo: Asset): { width: number; height: number } => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const image = (photo.fields as any)?.file?.details?.image;
    if (typeof image?.width === "number" && typeof image?.height === "number") {
      return { width: image.width, height: image.height };
    }
    return { width: 1920, height: 1440 };
  };

  const isPanoramic = (photo: Asset): boolean => {
    const { width, height } = getImageDimensions(photo);
    return height > 0 && width / height >= PANORAMIC_RATIO_THRESHOLD;
  };

  const openLightbox = (photo: Asset) => {
    setSelectedPhoto(photo);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
  };

  const goToPrevious = () => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex((p) => p.sys.id === selectedPhoto.sys.id);
    const previousIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    setSelectedPhoto(photos[previousIndex]);
  };

  const goToNext = () => {
    if (!selectedPhoto) return;
    const currentIndex = photos.findIndex((p) => p.sys.id === selectedPhoto.sys.id);
    const nextIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    setSelectedPhoto(photos[nextIndex]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
  };

  return (
    <>
      {/* Photo Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo, index) => {
          const imageUrl = getImageUrl(photo);
          const imageTitle = getImageTitle(photo);

          if (!imageUrl) return null;

          const panoramic = isPanoramic(photo);
          const { width, height } = getImageDimensions(photo);

          return (
            <button
              key={photo.sys.id}
              onClick={() => openLightbox(photo)}
              style={panoramic ? { aspectRatio: `${width} / ${height}` } : undefined}
              className={`group relative overflow-hidden rounded-lg bg-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                panoramic ? "col-span-full" : "aspect-[4/3]"
              }`}
              aria-label={`View photo ${index + 1} - ${imageTitle}`}
            >
              <Image
                src={`https:${imageUrl}`}
                alt={imageTitle}
                fill
                sizes={
                  panoramic
                    ? "100vw"
                    : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                }
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

              {/* Expand icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  className="h-12 w-12 text-white drop-shadow-lg"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                  />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          tabIndex={-1}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close photo viewer"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Previous button */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Previous photo"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Next button */}
          {photos.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 z-10 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Next photo"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}

          {/* Photo */}
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const { width, height } = getImageDimensions(selectedPhoto);
              return (
                <Image
                  src={`https:${getImageUrl(selectedPhoto)}`}
                  alt={getImageTitle(selectedPhoto)}
                  width={width}
                  height={height}
                  className="h-auto w-auto max-h-[90vh] max-w-[90vw] object-contain"
                  priority
                />
              );
            })()}
          </div>

          {/* Photo counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white">
            {photos.findIndex((p) => p.sys.id === selectedPhoto.sys.id) + 1} /{" "}
            {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
