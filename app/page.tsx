"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Landingpage/header";
import MasonryGrid from "@/components/Landingpage/masonry-grid";
import AuthModal from "@/components/AuthModal";
import WalletModal from "@/components/WalletModal";

export interface ImageItem {
  id: number;
  title: string;
  price: number;
  url: string;
  ownerId: number;
  noOfPeopleBought: number;
  createdAt: string;
  User?: { name: string; addressToReceive: string };
}

function HomeContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [purchasedIds, setPurchasedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  // Check for successful purchase from URL params
  const purchasedId = searchParams.get("purchased");

  useEffect(() => {
    if (purchasedId) {
      // Refresh purchases and clear URL
      router.replace("/");
    }
  }, [purchasedId, router]);

  useEffect(() => {
    async function fetchData() {
      // Fetch all images
      const { data: imageData, error } = await supabase
        .from("Image")
        .select("*, User(name, addressToReceive)")
        .order("createdAt", { ascending: false });

      if (error) {
        console.error("Error fetching images:", error);
      } else {
        setImages(imageData || []);
      }

      // Fetch user's purchases if logged in
      if (user) {
        const { data: purchases } = await supabase
          .from("Purchase")
          .select("imageId")
          .eq("userId", user.id);

        if (purchases) {
          setPurchasedIds(new Set(purchases.map((p: { imageId: number }) => p.imageId)));
        }
      }

      setLoading(false);
    }

    fetchData();
  }, [user, purchasedId]);

  function handleImageClick(image: ImageItem) {
    if (!user) {
      // Show auth modal for non-logged users
      setSelectedImage(image);
      setShowAuthModal(true);
      return;
    }

    // For logged in users
    if (image.ownerId === user.id || purchasedIds.has(image.id)) {
      // Owned or purchased - show full view or trigger download
      handleDownload(image);
      return;
    }
    
    // Trigger buy flow
    handleBuy(image);
  }

  function handleBuy(image: ImageItem) {
    if (!user) {
      setSelectedImage(image);
      setShowAuthModal(true);
      return;
    }

    // Show wallet modal to connect wallet for payment
    setSelectedImage(image);
    setShowWalletModal(true);
  }

  function handlePayment(image: ImageItem) {
    // Get referrer from URL if exists
    const referrer = searchParams.get("ref");
    const paymentUrl = `/api/purchase?imageId=${image.id}&userId=${user?.id}${
      referrer ? `&ref=${referrer}` : ""
    }`;
    router.push(paymentUrl);
  }

  async function handleDownload(image: ImageItem) {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${image.title}.${image.url.split(".").pop()?.split("?")[0] || "png"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      window.open(image.url, "_blank");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onLoginClick={() => setShowAuthModal(true)}
        onSignupClick={() => setShowAuthModal(true)}
      />
      
      <main className="pt-20">
        {/* Success message */}
        {purchasedId && (
          <div className="max-w-4xl mx-auto px-4 pt-4">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl">
              🎉 Purchase successful! You can now download the image.
            </div>
          </div>
        )}

        <MasonryGrid
          images={images}
          loading={loading}
          purchasedIds={purchasedIds}
          userId={user?.id}
          onImageClick={handleImageClick}
          onBuy={handleBuy}
          onDownload={handleDownload}
        />
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setSelectedImage(null);
        }}
      />

      {/* Wallet Modal for purchasing */}
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => {
          setShowWalletModal(false);
          setSelectedImage(null);
        }}
        image={selectedImage}
        onProceed={() => {
          if (selectedImage) {
            handlePayment(selectedImage);
          }
        }}
      />
    </div>
  );
}

// Wrap in Suspense for useSearchParams
export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
