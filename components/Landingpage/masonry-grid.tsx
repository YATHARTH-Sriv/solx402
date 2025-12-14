"use client";

import PinCard from "./pincard";

interface ImageItem {
  id: number;
  title: string;
  price: number;
  url: string;
  ownerId: number;
  noOfPeopleBought: number;
  createdAt: string;
  User?: { name: string; addressToReceive: string };
}

interface MasonryGridProps {
  images: ImageItem[];
  loading: boolean;
  purchasedIds: Set<number>;
  userId?: number;
  onImageClick: (image: ImageItem) => void;
  onBuy: (image: ImageItem) => void;
  onDownload: (image: ImageItem) => void;
}

export default function MasonryGrid({
  images,
  loading,
  purchasedIds,
  userId,
  onImageClick,
  onBuy,
  onDownload,
}: MasonryGridProps) {
  if (loading) {
    return (
      <div className="px-4 pb-12 flex justify-center items-center min-h-[50vh]">
        <div className="text-muted-foreground">Loading amazing artwork...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="px-4 pb-12 flex flex-col justify-center items-center min-h-[50vh] gap-4">
        <div className="text-muted-foreground text-lg">No artwork yet</div>
        <p className="text-sm text-muted-foreground">Be the first to upload!</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-12">
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
        {images.map((image) => {
          const isOwner = userId === image.ownerId;
          const isPurchased = purchasedIds.has(image.id);

          return (
            <PinCard
              key={image.id}
              image={image}
              isOwner={isOwner}
              isPurchased={isPurchased}
              onImageClick={() => onImageClick(image)}
              onBuy={() => onBuy(image)}
              onDownload={() => onDownload(image)}
            />
          );
        })}
      </div>
    </div>
  );
}
