"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login } = useAuth();
  const [step, setStep] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  
  // Login form - just email for simplicity (no password in schema)
  const [email, setEmail] = useState("");
  
  // Signup form
  const [name, setName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [signupEmail, setSignupEmail] = useState("");

  if (!isOpen) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("User")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (error || !data) {
        alert("Account not found. Please sign up first.");
        setStep("signup");
        setSignupEmail(email);
        setLoading(false);
        return;
      }

      login(data);
      onClose();
      // Reset form
      setEmail("");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !signupEmail || !walletAddress) {
      alert("Please fill all fields");
      return;
    }

    if (!walletAddress || walletAddress.length < 32 || walletAddress.length > 44) {
      alert("Please enter a valid Solana wallet address (32-44 characters)");
      return;
    }

    setLoading(true);
    try {
      // Check if user already exists
      const { data: existing } = await supabase
        .from("User")
        .select("id")
        .eq("email", signupEmail.trim().toLowerCase())
        .single();

      if (existing) {
        alert("Email already registered. Please login.");
        setStep("login");
        setEmail(signupEmail);
        setLoading(false);
        return;
      }

      // Create new user matching schema exactly
      const { data, error } = await supabase
        .from("User")
        .insert([
          {
            name: name.trim(),
            email: signupEmail.trim().toLowerCase(),
            addressToReceive: walletAddress.trim(),
            earned: 0,
            txnHashes: [],
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Signup error:", error);
        alert("Failed to create account: " + error.message);
        setLoading(false);
        return;
      }

      login(data);
      onClose();
      // Reset form
      setName("");
      setSignupEmail("");
      setWalletAddress("");
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
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

        <div className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="size-12 rounded-full bg-red-500 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">P</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Welcome to Pinspire
          </h2>
          <p className="text-center text-gray-500 mb-6">
            {step === "login" 
              ? "Sign in to continue" 
              : "Create your account"}
          </p>

          {step === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-full font-semibold h-12"
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none text-gray-900"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Address (to receive payments)
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none font-mono text-sm text-gray-900"
                  placeholder="soladdress"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is where you&apos;ll receive payments when someone buys your art
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-full font-semibold h-12"
              >
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Toggle */}
          <p className="text-center text-gray-600">
            {step === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => setStep("signup")}
                  className="text-red-500 font-semibold hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setStep("login")}
                  className="text-red-500 font-semibold hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          {/* Info */}
          <p className="text-xs text-gray-400 text-center mt-6">
            By continuing, you agree to Pinspire&apos;s Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
}
