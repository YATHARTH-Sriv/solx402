"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Landingpage/header";
import Image from "next/image";
import { 
  // User, 
  Wallet, 
  DollarSign, 
  ImageIcon, 
  ShoppingBag, 
  Download,
  ExternalLink,
  Settings,
  TrendingUp,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

interface ImageItem {
  id: number;
  title: string;
  price: number;
  url: string;
}

interface Purchase {
  id: number;
  pricePaid: number;
  txnHash: string;
  createdAt: string;
  Image?: ImageItem;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  addressToReceive: string;
  earned: number;
  referralEarnings?: number;
  txnHashes: string[];
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();
  const [uploadedImages, setUploadedImages] = useState<ImageItem[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'uploads' | 'purchases'>('uploads');

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    
    async function fetchData() {
      if (!user) return;
      
      // Fetch user data
      const { data: userInfo } = await supabase
        .from("User")
        .select("*")
        .eq("email", user.email)
        .single();
      
      setUserData(userInfo);

      // Fetch uploaded images
      const { data: images } = await supabase
        .from("Image")
        .select("*")
        .eq("ownerId", user.id)
        .order("createdAt", { ascending: false });

      // Fetch purchases
      const { data: purchaseData } = await supabase
        .from("Purchase")
        .select("*, Image(*)")
        .eq("userId", user.id)
        .order("createdAt", { ascending: false });

      setUploadedImages(images || []);
      setPurchases(purchaseData || []);
      setLoading(false);
    }
    
    fetchData();
  }, [user, router]);

  async function handleClaimEarnings() {
    if (!user || !userData) return;
    
    setClaiming(true);
    setClaimMessage(null);

    try {
      const response = await fetch("/api/claim-earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to claim earnings");
      }

      setClaimMessage({
        type: 'success',
        text: `Successfully claimed $${data.amount.toFixed(2)}!`
      });

      // Refresh user data
      const { data: userInfo } = await supabase
        .from("User")
        .select("*")
        .eq("email", user.email)
        .single();
      
      setUserData(userInfo);

      setTimeout(() => setClaimMessage(null), 5000);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to claim earnings";
      setClaimMessage({
        type: 'error',
        text: message
      });
    } finally {
      setClaiming(false);
    }
  }

  async function handleDownload(image: ImageItem) {
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        {/* Profile Header */}
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="size-24 rounded-full bg-linear-to-br from-red-400 to-red-600 flex items-center justify-center">
                <span className="text-white text-4xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-500">{user.email}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="size-4" />
                    {uploadedImages.length} uploads
                  </span>
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="size-4" />
                    {purchases.length} purchases
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/upload")}
                  className="rounded-full"
                >
                  Upload Art
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Earnings Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-xl">
                  <DollarSign className="size-6 text-green-600" />
                </div>
                <TrendingUp className="size-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-3xl font-bold text-gray-900">
                ${userData?.earned?.toFixed(2) || "0.00"}
              </p>
              
              {/* Claim Button */}
              {userData && parseFloat(String(userData.earned)) > 0 && (
                <Button
                  onClick={handleClaimEarnings}
                  disabled={claiming || !connected}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white rounded-full"
                >
                  {claiming ? "Processing..." : `Claim $${userData.earned}`}
                </Button>
              )}

              {/* Claim Message */}
              {claimMessage && (
                <div className={`mt-3 p-2 rounded-lg text-sm ${
                  claimMessage.type === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {claimMessage.text}
                </div>
              )}
            </div>

            {/* Referral Earnings Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Share2 className="size-6 text-blue-600" />
                </div>
                <TrendingUp className="size-5 text-blue-500" />
              </div>
              <p className="text-sm text-gray-500">Referral Earnings</p>
              <p className="text-3xl font-bold text-gray-900">
                ${userData?.referralEarnings?.toFixed(4) || "0.00"}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                10% commission per referral
              </p>
            </div>

            {/* Receiving Wallet Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Wallet className="size-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500">Receiving Wallet</p>
              <p className="text-sm font-mono text-gray-900 truncate mt-1">
                {user.addressToReceive}
              </p>
              <a 
                href={`https://explorer.solana.com/address/${user.addressToReceive}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-2"
              >
                View on Solana Explorer
                <ExternalLink className="size-3" />
              </a>
            </div>

            {/* Connected Wallet Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Settings className="size-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-500">Payment Wallet</p>
              {connected && walletAddress ? (
                <>
                  <p className="text-sm font-mono text-gray-900 truncate mt-1">
                    {walletAddress}
                  </p>
                  <p className="text-xs text-green-600 mt-2">● Connected</p>
                </>
              ) : (
                <div className="mt-2">
                  <WalletMultiButton 
                    style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #e5e7eb',
                      borderRadius: '9999px',
                      fontSize: '14px',
                      height: '36px',
                      padding: '0 16px',
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Referral Links Section */}
          {uploadedImages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Referral Links</h2>
              <p className="text-sm text-gray-600 mb-4">
                Share these links and earn 10% commission on every sale!
              </p>
              <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="bg-white rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {image.title}
                        </p>
                        <p className="text-xs text-gray-600 font-mono bg-gray-50 p-1.5 mt-1 rounded truncate">
                          {`${window.location.origin}/image/${image.id}?ref=${user.addressToReceive}`}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const url = `${window.location.origin}/image/${image.id}?ref=${user.addressToReceive}`;
                          navigator.clipboard.writeText(url);
                        }}
                        className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                        title="Copy link"
                      >
                        <Share2 className="size-4 text-blue-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-4 border-b mb-6">
            <button
              onClick={() => setActiveTab('uploads')}
              className={`pb-3 px-2 font-semibold transition-colors ${
                activeTab === 'uploads'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Uploads ({uploadedImages.length})
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`pb-3 px-2 font-semibold transition-colors ${
                activeTab === 'purchases'
                  ? 'text-red-500 border-b-2 border-red-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Purchases ({purchases.length})
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : (
            <>
              {/* Uploads Tab */}
              {activeTab === 'uploads' && (
                <div>
                  {uploadedImages.length === 0 ? (
                    <div className="text-center py-12">
                      <ImageIcon className="size-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No uploads yet</p>
                      <Button
                        onClick={() => router.push("/upload")}
                        className="mt-4 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        Upload Your First Art
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {uploadedImages.map((img) => (
                        <div key={img.id} className="group relative rounded-2xl overflow-hidden bg-gray-100">
                          <div className="relative aspect-square">
                            <Image 
                              src={img.url} 
                              alt={img.title} 
                              fill 
                              className="object-cover" 
                            />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white font-medium text-sm truncate">{img.title}</p>
                              <p className="text-white/70 text-xs">$0.01</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Purchases Tab */}
              {activeTab === 'purchases' && (
                <div>
                  {purchases.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingBag className="size-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No purchases yet</p>
                      <Button
                        onClick={() => router.push("/")}
                        className="mt-4 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      >
                        Explore Art
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {purchases.map((p) => (
                        <div key={p.id} className="group relative rounded-2xl overflow-hidden bg-gray-100">
                          {p.Image && (
                            <>
                              <div className="relative aspect-square">
                                <Image 
                                  src={p.Image.url} 
                                  alt={p.Image.title} 
                                  fill 
                                  className="object-cover" 
                                />
                              </div>
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <Button
                                  onClick={() => handleDownload(p.Image!)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 rounded-full"
                                >
                                  <Download className="size-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                              <div className="absolute bottom-0 left-0 right-0 p-3 bg-linear-to-t from-black/60 to-transparent">
                                <p className="text-white font-medium text-sm truncate">{p.Image.title}</p>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
