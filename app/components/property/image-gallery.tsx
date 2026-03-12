import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface ImageGalleryProps {
  images: string[];
  name: string;
}

export function ImageGallery({ images, name }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const goTo = (i: number) => {
    setActiveIndex((i + images.length) % images.length);
  };

  return (
    <>
      <div className="overflow-hidden rounded-2xl">
        <div
          className="relative aspect-video cursor-pointer md:aspect-2/1 lg:aspect-5/2"
          onClick={() => setLightboxOpen(true)}
        >
          <img
            src={images[activeIndex]}
            alt={`${name} - ${activeIndex + 1}`}
            className="h-full w-full object-cover"
          />
          <Badge variant="secondary" className="absolute bottom-3 right-3">
            {activeIndex + 1}/{images.length}
          </Badge>
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(activeIndex - 1);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-2 backdrop-blur-sm hover:bg-background/90"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goTo(activeIndex + 1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/70 p-2 backdrop-blur-sm hover:bg-background/90"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  i === activeIndex
                    ? "border-primary"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`${name} thumb ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-background/20 p-2 text-white hover:bg-background/40"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goTo(activeIndex - 1);
            }}
            className="absolute left-4 rounded-full bg-background/20 p-3 text-white hover:bg-background/40"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <img
            src={images[activeIndex]}
            alt={name}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              goTo(activeIndex + 1);
            }}
            className="absolute right-4 rounded-full bg-background/20 p-3 text-white hover:bg-background/40"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-6 text-sm text-white/70">
            {activeIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}
