# Pinspire - x402 Art Gallery (Solana)

## Project Highlights

- **Pinterest-style art gallery** where photographers/artists showcase and sell high-res images
- **x402 micropayment integration** - $0.01 USDC per image download on Solana
- **Referral/Affiliate system** - Earn 10% commission on every sale via shareable links
- **Beautiful masonry grid UI** with Pinterest-inspired aesthetics

## Authentication

- Simple email-based auth (no password required)
- Signup collects: name, email, Solana wallet address (for receiving payments)
- LocalStorage session persistence

## Payment Flow

- Solana wallet connection (Phantom, Solflare) for purchases
- x402-next middleware handles payment verification
- Automatic payment splits (90% artist, 10% referrer if applicable)
- 3-second countdown success page after purchase
- Auto-redirect back to gallery
- Referral link support: `?ref=walletAddress` parameter preserved through entire flow

##  User Features

- **Gallery page**: Browse and purchase art, view details on dedicated image pages
- **Referral links**: Generate and share shareable links per artwork to earn 10% commissions
- **Profile page**: View uploads, purchases, earnings, referral earnings, and manage referral links
- **Upload page**: Drag-and-drop image upload with Vercel Blob storage
- **Claim earnings**: Transfer earned USDC + referral commissions to artist's Solana wallet
- **Image detail page**: Full image view with purchase/download options, preserves referral context

##  Tech Stack

- Next.js 16 (App Router) + React 19
- Supabase (PostgreSQL with referral columns)
- Vercel Blob (image storage)
- Solana Wallet Adapter (Phantom, Solflare)
- x402-next (payment middleware)
- @solana/web3.js + @solana/spl-token
- Tailwind CSS v4
- Solana Devnet + USDC

##  Database Schema

- **User**: id, name, email, addressToReceive, earned, referralEarnings, txnHashes
- **Image**: id, title, price, url, ownerId, noOfPeopleBought
- **Purchase**: id, userId, imageId, pricePaid, txnHash, referrerAddress, referralAmount

##  x402 on Solana - Key Achievements

1.   **Full x402 payment flow** - End-to-end micropayment system with payment verification
2.   **Programmable payment splits** - Demonstrates x402's ability to handle complex payment logic (90/10 splits)
3.   **Dynamic referral system** - Shareable links with automatic commission tracking and distribution
4.   **SPL token integration** - USDC transfers via viem + SPL token standard
5.   **Trustless automation** - No middleman, payments happen on-chain automatically
6.   **Scalable micropayments** - $0.01 price point with zero friction
7.   **Image detail pages** - Standalone pages for each artwork preserving referral context
8.   **Economic incentive layer** - Shows how programmable money creates new behaviors (affiliate system)
9.   **Wallet management** - Connect/disconnect/switch wallets for seamless payment experience
10.   **Earnings tracking** - Separate counters for direct sales vs referral commissions

##  Why This Wins for Hackathons

- Proves x402 can handle complex real-world payment scenarios
- Shows economic incentives layer (influencer/creator monetization model)
- Demonstrates trustless automation without middleware
- Real use case with practical applications
- Full tech stack integration: Solana, x402, smart earnings distribution
