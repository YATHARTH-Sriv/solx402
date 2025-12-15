# Pinspire - AI Training Data Marketplace on Solana

> **The future of creator monetization: AI agents autonomously purchasing high-quality training datasets, creators earn instant micropayments**

## 🎯 Overview

Pinspire is a **next-generation art marketplace** that combines:
- **x402 micropayments** for trustless, instant value exchange
- **Solana blockchain** for fast, scalable transactions
- **AI-agent API** for machine-to-machine purchasing
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

### 🤖 For AI Agents
- **REST API endpoint** for autonomous dataset purchases
- **x402 payment integration** for trustless transactions
- **Instant JSON response** with image data and metadata
- **Creator payouts** happen automatically
- **No registration needed** - agents can buy immediately

### 💳 For Buyers
- **Wallet connection** (Phantom, Solflare)
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
Wallets: Phantom, Solflare
```

## 📊 Database Schema

```sql
-- Users table
User {
  id, name, email, addressToReceive (Solana wallet),
  earned, referralEarnings, txnHashes, createdAt
}

-- Images table  
Image {
  id, title, price, url (Vercel Blob),
  ownerId (FK User), noOfPeopleBought, createdAt
}

-- Purchases table
Purchase {
  id, userId (FK User), imageId (FK Image),
  pricePaid, txnHash, referrerAddress, referralAmount, createdAt
}
```

## 🤖 AI Agent Marketplace API

The **killer feature** that wins hackathons: AI agents can autonomously purchase training datasets.

### Endpoint: `POST /api/agent/buy?imageId=123`

**How it works:**

1. **Agent queries marketplace:**
   ```bash
   curl GET http://localhost:3000/api/agent/buy?action=info
   ```

2. **Agent checks image availability:**
   ```bash
   curl GET http://localhost:3000/api/agent/buy?imageId=1&action=image-info
   ```

3. **Agent initiates purchase:**
   ```bash
   curl -X POST http://localhost:3000/api/agent/buy?imageId=1 \
     -H "x-agent-address: my_bot_v1"
   ```

4. **Gets 402 Payment Required** → Agent completes x402 payment on Solana

5. **Gets image data + metadata:**
   ```json
   {
     "success": true,
     "transaction": {
       "hash": "5bNvP7q8RxM3KhJ2WpL4Yz9...",
       "amount": 0.01,
       "currency": "USDC",
       "network": "solana-devnet"
     },
     "image": {
       "id": 1,
       "title": "Mountain Sunset",
       "url": "https://blob.vercelusercontent.com/...",
       "format": "high-resolution",
       "license": "personal-use"
     },
     "creator": {
       "name": "Alex Photography",
       "earnedThisSale": 0.01,
       "totalEarnings": 45.23
     }
   }
   ```

### Demo Scripts

**Bash version (quick overview):**
```bash
./demo-agent-buy.sh http://localhost:3000 1
```

**Python version (full simulation):**
```bash
pip install requests
python3 demo-agent-buy.py http://localhost:3000
```

## 🎯 How x402 Integration Works

### User Purchase Flow (Browser)
```
User connects wallet → Selects image → Clicks "Buy" 
→ x402 middleware returns 402 Payment Required 
→ User completes payment via facilitator UI 
→ Payment verified, image unlocked, earnings updated
```

### AI Agent Purchase Flow (Programmatic)
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
cp .env.example .env.local
# Edit .env.local with your Supabase & x402 credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📝 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# x402 Configuration
NEXT_PUBLIC_NETWORK=solana-devnet
NEXT_PUBLIC_RECEIVER_ADDRESS=your_treasury_wallet
NEXT_PUBLIC_FACILITATOR_URL=https://x402.org/facilitator
NEXT_PUBLIC_CDP_CLIENT_KEY=your_cdp_key

# Vercel Blob (Image Storage)
BLOB_READ_WRITE_TOKEN=your_blob_token

# Solana (for claiming earnings)
SOLANA_PRIVATE_KEY=your_treasury_private_key_base58
```

## 🏆 Why This Wins

### ✅ For "Best Use of x402 with Solana" Track:

1. **Demonstrates x402 value:** Shows real-world micropayment use case
2. **Solana integration:** Trustless, instant, scalable
3. **Programmable logic:** Payment splits (90/10 referral system)
4. **AI-ready:** Machine-to-machine transactions prove future potential
5. **Economic incentive layer:** Creates new behaviors (affiliate marketplaces)
6. **Production-ready:** Clean code, proper error handling, documented

### 🎯 Judging Criteria Met:
- ✅ Clear use of x402 (payment gateway for every transaction)
- ✅ Clear use of Solana (devnet USDC, instant settlement)
- ✅ Strong technical execution (full-stack with database)
- ✅ Realistic adoption (real use case: creator monetization)
- ✅ Clean documentation (this README + inline comments)
- ✅ Demo video ready (can show agent buying in 2 seconds)

## 📹 Demo Video Talking Points

**Opening (0:00-0:30):** 
"Pinspire isn't just a gallery—it's the first AI training data marketplace where agents autonomously purchase datasets and creators earn instant micropayments on Solana."

**Feature Tour (0:30-2:00):**
1. Show gallery page (beautiful masonry layout)
2. Show upload feature (creator onboarding)
3. Show purchase (buyer completes transaction in 3 seconds)
4. Show profile/earnings dashboard

**AI Agent Demo (2:00-3:00):**
1. Open terminal with `demo-agent-buy.py`
2. Run: `python3 demo-agent-buy.py`
3. Show agent querying marketplace
4. Show agent completing purchase automatically
5. Show creator earnings updated in real-time

**Closing (3:00-3:30):**
"This is the future: trustless, instant, programmable payments. Artists keep 100% of earnings. Agents get data. No middlemen. Only x402 + Solana."

## 🔗 Related Resources

- [x402 Documentation](https://x402.org)
- [Solana Docs](https://docs.solana.com)
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)

## 📄 License

MIT

---

**Built with ❤️ for the Solana Foundation x402 Hackathon**
