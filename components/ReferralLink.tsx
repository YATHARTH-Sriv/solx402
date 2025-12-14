"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReferralLinkProps {
  imageId: number;
  imageTitle: string;
  walletAddress: string;
}

export default function ReferralLink({
  imageId,
  imageTitle,
  walletAddress,
}: ReferralLinkProps) {
  const [copied, setCopied] = useState(false);

  const referralUrl = `${window.location.origin}/image/${imageId}?ref=${walletAddress}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareLink() {
    if (navigator.share) {
      navigator.share({
        title: imageTitle,
        text: `Check out this amazing art! Buy it and I earn a commission.`,
        url: referralUrl,
      });
    } else {
      handleCopyLink();
    }
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-900 mb-1">
            <Share2 className="inline size-4 mr-1" />
            Referral Link
          </p>
          <p className="text-xs text-blue-700 break-all font-mono bg-white p-2 rounded border border-blue-100">
            {referralUrl}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Earn 10% commission when someone buys through your link
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleCopyLink}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
          <Button
            onClick={handleShareLink}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Share2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
