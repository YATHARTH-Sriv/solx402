this is the middleware code i found from the x402 example with nextjs on solana

import { Address } from 'viem'
import { paymentMiddleware, Resource, Network } from 'x402-next'
import { NextRequest } from 'next/server'

const address = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS as Address
const network = process.env.NEXT_PUBLIC_NETWORK as Network
const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL as Resource
const cdpClientKey = process.env.NEXT_PUBLIC_CDP_CLIENT_KEY as string

const x402PaymentMiddleware = paymentMiddleware(
  address,
  {
    '/content/cheap': {
      price: '$0.01',
      config: {
        description: 'Access to cheap content',
      },
      network,
    },
    '/content/expensive': {
      price: '$0.25',
      config: {
        description: 'Access to expensive content',
      },
      network,
    },
  },
  {
    url: facilitatorUrl,
  },
  {
    cdpClientKey,
    appLogo: '/logos/x402-examples.png',
    appName: 'x402 Demo',
    sessionTokenEndpoint: '/api/x402/session-token',
  },
)

export const middleware = (req: NextRequest) => {
  const delegate = x402PaymentMiddleware as unknown as (
    request: NextRequest,
  ) => ReturnType<typeof x402PaymentMiddleware>
  return delegate(req)
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
    '/', // Include the root path explicitly
  ],
}


page.tsx --

import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <h1 className="text-4xl font-bold mb-4">Welcome to x402 Solana Template</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This is a Next.js template with Solana payment integration using the x402 protocol.
          </p>
          <div className="flex gap-4">
            <Link
              href="/content/cheap"
              className="inline-block px-6 py-3 bg-neutral-800 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Access Cheap Content 🪣
            </Link>
            <Link
              href="/content/expensive"
              className="inline-block px-6 py-3 bg-neutral-800 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Access Expensive Content 💰
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}


/content/[type]/page.tsx ---- 


import { CatsComponent } from '@/components/cats-component'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const CONTENT_CONFIG = {
  cheap: {
    price: '0.01',
    title: 'Budget Content',
    message: 'This is what you get when you pay for cheap content: angry, starving, and sad cats. 😿',
  },
  expensive: {
    price: '0.25',
    title: 'Premium Content',
    message: 'You deserve the best! Here are some happy, wealthy cats living their best lives. 🐱💰✨',
  },
} as const

type ContentType = keyof typeof CONTENT_CONFIG

export default async function ContentPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params

  if (!['cheap', 'expensive'].includes(type)) {
    notFound()
  }

  const contentType = type as ContentType
  const config = CONTENT_CONFIG[contentType]

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#14F195] to-[#9945FF] font-sans">
      <main className="flex w-full max-w-2xl flex-col items-center justify-center p-8">
        <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
          <div className="bg-gradient-to-br from-purple-50 to-green-50 rounded-xl p-8 mb-8 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔓 Exclusive Content Unlocked</h2>
            <p className="text-gray-700 leading-relaxed mb-6 font-medium">
              {config.message} You paid {config.price}!
            </p>
            <CatsComponent contentType={contentType} />
          </div>

          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-neutral-800 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}


.env.example -- nedded things 

# X402 Configuration
# Copy this file to .env.local and fill in your values

# Your Solana wallet address that will receive payments
# This is where all payments will be sent
NEXT_PUBLIC_RECEIVER_ADDRESS=CmGgLQL36Y9ubtTsy2zmE46TAxwCBm66onZmPPhUWNqv

# Solana network to use
# Options: solana-devnet, solana-mainnet-beta, solana-testnet
# Use devnet for testing with fake tokens, mainnet for production with real money
NEXT_PUBLIC_NETWORK=solana-devnet

# Facilitator URL
# The service that verifies payments on the blockchain
# Default: https://x402.org/facilitator
NEXT_PUBLIC_FACILITATOR_URL=https://x402.org/facilitator

# Coinbase Developer Platform Client Key
# Get this from: https://portal.cdp.coinbase.com/
# This enables Coinbase Pay for user payments
NEXT_PUBLIC_CDP_CLIENT_KEY=your_client_key_here
