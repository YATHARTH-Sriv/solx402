# Pinspire -  Image Marketplace on Solana

> **The future of creator monetization: Agents autonomously purchasing high-quality training datasets, creators earn instant micropayments**


## 🎯 Overview

Pinspire is a **next-generation art marketplace** that combines:
- **x402 micropayments** for trustless, instant value exchange
- **Solana blockchain** for fast, scalable transactions
- **Agent API** for machine-to-machine purchasing
- **Programmable payment splits** (referral system)
- **Creator earnings** direct to wallet

Perfect for artists, photographers, and creators who want to monetize their work at any price point.

## 🚀 Key Features

### 👥 For Creators
- **Simple email-based auth** (no passwords)
- **Gallery page** to showcase your work
- **One-click uploads** with Vercel Blob storage
- **Real-time earnings dashboard** (direct sales + referral commissions)
- **Claim button** to withdraw earnings to your Solana wallet
- **Referral links** to earn 10% commission on every sale

### 🤖 For Agents
- **REST API endpoint** for autonomous dataset purchases
- **x402 payment integration** for trustless transactions
- **Instant JSON response** with image data and metadata
- **Creator payouts** happen automatically
- **No registration needed** - agents can buy immediately

### 💳 For Buyers
- **Wallet connection** (Phantom)
- **$0.01 USDC** per high-res image download
- **Instant access** after payment
- **Share with referral link** to earn commissions

## 🛠️ Tech Stack

```
Frontend: Next.js 16 (App Router) + React 19 + Tailwind CSS
Backend: Next.js API routes + Supabase (PostgreSQL)
Blockchain: Solana (Devnet) + SPL Token (USDC)
Payments: x402-next + x402.org facilitator
Storage: Vercel Blob
Auth: Email-based (Supabase)
Wallets: Phantom
```

## 🎯 How x402 Integration Works

### User Purchase Flow (Browser)
```
User connects wallet → Selects image → Clicks "Buy" 
→ x402 middleware returns 402 Payment Required 
→ User completes payment via facilitator UI 
→ Payment verified, image unlocked, earnings updated
```

### Agent Purchase Flow (Programmatic)
```
Agent initiates POST /api/agent/buy 
→ x402 middleware returns 402 Payment Required 
→ Agent signs & broadcasts payment on Solana 
→ x402 verifies payment, agent receives image data 
→ Creator earnings updated automatically
```

## 📈 Referral System - Hackathon Bonus

Every creator gets shareable referral links:
- **Format:** `https://pinspire.xyz/image/123?ref=solana_wallet_address`
- **Commission:** 10% of every sale made through their link
- **Splits:** 90% artist, 10% referrer (automatic via x402)
- **Tracked:** Separate `referralEarnings` column in database

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Solana Devnet wallet (Phantom or Solflare)
- Supabase account
- NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY

### Installation

```bash
# Clone repo
git clone https://github.com/YATHARTH-Sriv/solx402.git
cd solx402

# Install dependencies
npm install

# Set up environment variables
.env file 

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
BLOB_READ_WRITE_TOKEN=""
NEXT_PUBLIC_RECEIVER_ADDRESS==
NEXT_PUBLIC_NETWORK=
NEXT_PUBLIC_FACILITATOR_URL=
NEXT_PUBLIC_CDP_CLIENT_KEY=
RESOURCE_WALLET_PRIVATE_KEY=

```
agent implementation code : https://github.com/YATHARTH-Sriv/agentimpl

