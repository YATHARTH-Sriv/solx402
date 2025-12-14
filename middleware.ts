import { Address } from 'viem'
import { paymentMiddleware, Resource, Network } from 'x402-next'
import { NextRequest } from 'next/server'

const address = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS as Address
const network = (process.env.NEXT_PUBLIC_NETWORK || 'solana-devnet') as Network
const facilitatorUrl = (process.env.NEXT_PUBLIC_FACILITATOR_URL || 'https://x402.org/facilitator') as Resource
const cdpClientKey = process.env.NEXT_PUBLIC_CDP_CLIENT_KEY as string

console.log('x402 middleware config:', { address, network, facilitatorUrl, cdpClientKey: cdpClientKey ? 'set' : 'missing' })

const x402PaymentMiddleware = paymentMiddleware(
  address,
  {
    '/api/purchase': {
      price: '$0.01',
      config: {
        description: 'Download High Resolution Art',
      },
      network,
    },
  },
  {
    url: facilitatorUrl,
  },
  {
    cdpClientKey,
    appLogo: '/x402-icon-blue.png',
    appName: 'Pinspire Art Gallery',
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
  matcher: ['/api/purchase'],
}
