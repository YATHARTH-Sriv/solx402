"use client";

import { X, Wallet, ArrowRight, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Image from "next/image";

interface ImageItem {
  id: number;
  title: string;
  url: string;
}

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageItem | null;
  onProceed: () => void;
}

export default function WalletModal({
  isOpen,
  onClose,
  image,
  onProceed,
}: WalletModalProps) {
  const { connected, publicKey, disconnect } = useWallet();

  if (!isOpen || !image) return null;

  const walletAddress = publicKey?.toBase58();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="size-5 text-gray-500" />
        </button>

        {/* Image preview */}
        <div className="relative h-40 bg-gray-100">
          <Image
            src={image.url}
            alt={image.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-white font-semibold text-lg">{image.title}</p>
          </div>
        </div>

        <div className="p-6">
          {/* Price info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Price</span>
              <span className="text-2xl font-bold text-gray-900">$0.01</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Paid in USDC on Solana {process.env.NEXT_PUBLIC_NETWORK === "solana-mainnet-beta" ? "Mainnet" : "Devnet"}
            </p>
          </div>

          {/* Wallet connection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Wallet className="size-4" />
              Connect Solana Wallet to Pay
            </h3>

            {connected && walletAddress ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Wallet Connected
                      </p>
                      <p className="text-xs text-green-600 font-mono">
                        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                      </p>
                    </div>
                    <div className="size-3 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors py-2"
                >
                  <LogOut className="size-4" />
                  Disconnect / Change Wallet
                </button>
              </div>
            ) : (
              <div className="flex justify-center">
                <WalletMultiButton 
                  style={{
                    backgroundColor: '#2563eb',
                    borderRadius: '12px',
                    height: '48px',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                />
              </div>
            )}
          </div>

          {/* Proceed button */}
          <Button
            onClick={onProceed}
            disabled={!connected}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full py-3 font-semibold"
          >
            {connected ? (
              <>
                Proceed to Payment
                <ArrowRight className="size-4 ml-2" />
              </>
            ) : (
              "Connect wallet first"
            )}
          </Button>

          {/* Info */}
          <p className="text-xs text-gray-500 text-center mt-4">
            You&apos;ll be redirected to complete the payment securely
          </p>
        </div>
      </div>
    </div>
  );
}
