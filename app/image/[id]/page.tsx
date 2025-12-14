"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Landingpage/header";
import WalletModal from "@/components/WalletModal";
import AuthModal from "@/components/AuthModal";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Share2, ArrowLeft } from "lucide-react";

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

function ImageDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const imageId = params.id as string;
  const referrerAddress = searchParams.get("ref");

  const [image, setImage] = useState<ImageItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    async function fetchImage() {
      const { data, error } = await supabase
        .from("Image")
        .select("*, User(name, addressToReceive)")
        .eq("id", parseInt(imageId))
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setImage(data);

      // Check if user has purchased
      if (user) {
        const { data: purchase } = await supabase
          .from("Purchase")
          .select("id")
          .eq("userId", user.id)
          .eq("imageId", parseInt(imageId))
          .single();

        if (purchase) {
          setIsPurchased(true);
        }
      }

      setLoading(false);
    }

    fetchImage();
  }, [imageId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-20 max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Image not found
          </h1>
          <Button
            onClick={() => router.push("/")}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Gallery
          </Button>
        </div>
      </div>
    );
  }

  function handleBuy() {
    if (!image) {
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (image.ownerId === user.id) {
      alert("You can't purchase your own artwork!");
      return;
    }

    setShowWalletModal(true);
  }

  function handlePayment() {
    if (!image || !user) {
      return;
    }

    const paymentUrl = `/api/purchase?imageId=${image.id}&userId=${user.id}${
      referrerAddress ? `&ref=${referrerAddress}` : ""
    }`;
    router.push(paymentUrl);
  }

  async function handleDownload() {
    if (!image) {
      return;
    }
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${image.title}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      window.open(image.url, "_blank");
    }
  }

  function handleShare() {
    if (!image) {
      return;
    }
    const shareUrl = `${window.location.origin}/image/${image.id}${
      referrerAddress ? `?ref=${referrerAddress}` : ""
    }`;

    if (navigator.share) {
      navigator.share({
        title: image.title,
        text: `Check out this amazing art by ${image.User?.name}!`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-20 pb-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Back button */}
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="mb-6"
          >
            <ArrowLeft className="size-4 mr-2" />
            Back to Gallery
          </Button>

          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            {/* Image */}
            <div className="relative h-96 bg-gray-100">
              <Image
                src={image.url}
                alt={image.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Details */}
            <div className="p-8">
              {/* Title and Artist */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {image.title}
                </h1>
                <p className="text-lg text-gray-600">
                  By{" "}
                  <span className="font-semibold">
                    {image.User?.name || "Anonymous"}
                  </span>
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8 pb-8 border-b">
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-2xl font-bold text-gray-900">$0.01</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purchased by</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {image.noOfPeopleBought}
                  </p>
                </div>
              </div>

              {/* Referral Info */}
              {referrerAddress && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    💡 You&apos;re using a referral link. The referrer will earn 10%
                    from your purchase!
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                {user && (isPurchased || image.ownerId === user.id) ? (
                  <>
                    <Button
                      onClick={handleDownload}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-full py-6 font-semibold"
                    >
                      <Download className="size-4 mr-2" />
                      Download High Res
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="px-6 rounded-full py-6"
                    >
                      <Share2 className="size-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={handleBuy}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full py-6 font-semibold"
                    >
                      Buy Now - $0.01
                    </Button>
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="px-6 rounded-full py-6"
                    >
                      <Share2 className="size-4" />
                    </Button>
                  </>
                )}
              </div>

              {/* Network info */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Powered by x402 on Solana Devnet
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        image={image}
        onProceed={handlePayment}
      />
    </div>
  );
}

export default function ImageDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <ImageDetailContent />
    </Suspense>
  );
}
