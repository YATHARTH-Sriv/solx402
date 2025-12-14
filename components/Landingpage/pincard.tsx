"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, ShoppingCart, Crown, Lock } from "lucide-react";

interface ImageItem {
  id: number;
  title: string;
  price: number;
  url: string;
  ownerId: number;
  noOfPeopleBought: number;
  User?: { name: string };
}

interface PinCardProps {
  image: ImageItem;
  isOwner: boolean;
  isPurchased: boolean;
  onImageClick: () => void;
  onBuy: () => void;
  onDownload: () => void;
}

export default function PinCard({
  image,
  isOwner,
  isPurchased,
  onImageClick,
  onBuy,
  onDownload,
}: PinCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const canAccess = isOwner || isPurchased;

  return (
    <div
      className="break-inside-avoid mb-4 relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onImageClick}
    >
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <Image
          src={image.url}
          alt={image.title}
          width={300}
          height={400}
          className={`w-full h-auto transition-transform duration-300 group-hover:scale-105 ${
            !canAccess ? "blur-sm" : ""
          }`}
        />

        {/* Lock overlay for non-purchased */}
        {!canAccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2">
              <Lock className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">$0.01 to unlock</span>
            </div>
          </div>
        )}

        {/* Owner badge */}
        {isOwner && (
          <div className="absolute top-3 left-3">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Crown className="size-3" />
              Your Art
            </div>
          </div>
        )}

        {/* Hover overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/40 transition-opacity duration-300">
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {canAccess ? (
                <Button
                  size="sm"
                  className="h-9 px-4 rounded-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload();
                  }}
                >
                  <Download className="size-4 mr-1" />
                  Download
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="h-9 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuy();
                  }}
                >
                  <ShoppingCart className="size-4 mr-1" />
                  Buy $0.01
                </Button>
              )}
            </div>
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white font-medium text-sm line-clamp-1">
                {image.title}
              </p>
              <p className="text-white/70 text-xs mt-1">
                by {image.User?.name || "Unknown"} • {image.noOfPeopleBought} sales
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
