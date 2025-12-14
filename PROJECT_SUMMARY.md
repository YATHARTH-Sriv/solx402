# Pinspire - x402 Art Gallery (Solana)

## 🎯 Project Highlights

- **Pinterest-style art gallery** where photographers/artists showcase and sell high-res images
- **x402 micropayment integration** - $0.01 USDC per image download on Solana
- **Beautiful masonry grid UI** with Pinterest-inspired aesthetics

## 🔐 Authentication

- Simple email-based auth (no password required)
- Signup collects: name, email, Solana wallet address (for receiving payments)
- LocalStorage session persistence

## 💳 Payment Flow

- Solana wallet connection (Phantom, Solflare) for purchases
- x402-next middleware handles payment verification
- 3-second countdown success page after purchase
- Auto-redirect back to gallery

## 👤 User Features

- **Profile page**: View uploads, purchases, and earnings
- **Upload page**: Drag-and-drop image upload with Vercel Blob storage
- **Claim earnings**: Transfer earned USDC to artist's Solana wallet

## 🛠️ Tech Stack

- Next.js 16 (App Router) + React 19
- Supabase (PostgreSQL)
- Vercel Blob (image storage)
- Solana Wallet Adapter (Phantom, Solflare)
- x402-next (payment middleware)
- @solana/web3.js + @solana/spl-token
- Tailwind CSS v4
- Solana Devnet + USDC

## 📊 Database Schema

- **User**: id, name, email, addressToReceive (Solana), earned, txnHashes
- **Image**: id, title, price, url, ownerId, noOfPeopleBought
- **Purchase**: id, userId, imageId, pricePaid, txnHash

## ✅ Key Achievements

1. Full x402 payment flow working end-to-end on Solana
2. Artists receive payments to their Solana wallet address
3. Claim earnings feature transfers USDC via SPL token
4. Pinterest-style responsive masonry layout
5. Wallet disconnect/change option for buyers
6. Post-purchase success page with auto-redirect
