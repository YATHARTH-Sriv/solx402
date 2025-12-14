"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/Landingpage/header";
import Image from "next/image";
import { 
  Upload, 
  ImageIcon, 
  X, 
  CheckCircle2,
  Loader2,
  DollarSign,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function UploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  function handleFileChange(selectedFile: File | null) {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    handleFileChange(droppedFile || null);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title || !user) {
      alert("Please add a title and image");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("ownerId", user.id.toString());

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/");
        }, 2000);
      } else {
        const data = await res.json();
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  }

  function clearFile() {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  if (!user) return null;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="pt-20 flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="size-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="size-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Upload Successful!
            </h2>
            <p className="text-gray-500">
              Your art is now live on Pinspire
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Art</h1>
          <p className="text-gray-500 mb-8">
            Share your artwork with the world
          </p>

          <form onSubmit={handleUpload} className="space-y-6">
            {/* Image Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-3xl transition-colors ${
                dragActive 
                  ? "border-red-500 bg-red-50" 
                  : preview 
                    ? "border-gray-200 bg-white" 
                    : "border-gray-300 bg-gray-50 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="relative">
                  <div className="relative w-full aspect-video rounded-3xl overflow-hidden">
                    <Image
                      src={preview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X className="size-5 text-white" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-16 cursor-pointer">
                  <div className="p-4 bg-gray-100 rounded-full mb-4">
                    <Upload className="size-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-700 mb-1">
                    Drag and drop or click to upload
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your art a name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900"
                required
              />
            </div>

            {/* Price Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">Fixed Price: $0.01</p>
                  <p className="text-sm text-blue-700 mt-1">
                    All artwork is priced at $0.01 USDC. You&apos;ll receive payments to your wallet address.
                  </p>
                </div>
              </div>
            </div>

            {/* Receiving Wallet Info */}
            <div className="bg-gray-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="size-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700">
                    Payments will be sent to:
                  </p>
                  <p className="font-mono text-xs text-gray-900 mt-1 break-all">
                    {user.addressToReceive}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !file || !title}
              className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white py-3 rounded-full font-semibold text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="size-5 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <ImageIcon className="size-5 mr-2" />
                  Publish Art
                </>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
