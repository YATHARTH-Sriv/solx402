import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * AI Agent API Endpoint for autonomous image purchasing
 * Allows AI bots to buy high-quality training datasets programmatically
 * 
 * Usage:
 * POST /api/agent/buy?imageId=123
 * Headers: x-payment-hash (from x402 payment proof)
 * 
 * Returns:
 * - 402: Payment Required (includes x402 payment details)
 * - 200: Image data + metadata (after successful payment)
 */

export async function POST(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const imageId = url.searchParams.get("imageId");
  const agentAddress = request.headers.get("x-agent-address") || "agent_anonymous";

  if (!imageId) {
    return NextResponse.json(
      { error: "imageId parameter required" },
      { status: 400 }
    );
  }

  try {
    // Fetch image from database
    const { data: image, error: imageError } = await supabase
      .from("Image")
      .select("*")
      .eq("id", parseInt(imageId))
      .single();

    if (imageError || !image) {
      return NextResponse.json(
        { error: "Image not found", imageId },
        { status: 404 }
      );
    }

    // Fetch artist info for earnings tracking
    const { data: artist, error: artistError } = await supabase
      .from("User")
      .select("id, name, email")
      .eq("id", image.ownerId)
      .single();

    if (artistError || !artist) {
      return NextResponse.json(
        { error: "Artist not found" },
        { status: 404 }
      );
    }

    // x402 middleware handles payment verification before this handler runs.
    // If we reach here, payment has already been verified by the middleware.
    // The middleware returns 402 if no/invalid payment, so this code only runs after successful payment.
    
    // Try to extract payment hash from x402 headers if available
    const paymentHash = request.headers.get("x-payment-hash") || 
                        request.headers.get("x-payment-response") || 
                        `agent_tx_${Date.now()}`;

    // Payment verified! Record the agent purchase
    const basePriceUSDC = 0.01;
    
    // Create purchase record for agent (no referral for agents by default)
    const { error: purchaseError } = await supabase.from("Purchase").insert([
      {
        userId: artist.id,
        imageId: image.id,
        pricePaid: basePriceUSDC,
        txnHash: paymentHash || `agent_tx_${Date.now()}`,
        referrerAddress: null,
        referralAmount: 0,
      },
    ]);

    if (purchaseError) {
      console.error("Purchase recording error:", purchaseError);
      return NextResponse.json(
        { error: "Failed to record purchase" },
        { status: 500 }
      );
    }

    // Update artist earnings
    const { data: currentUser } = await supabase
      .from("User")
      .select("earned")
      .eq("id", artist.id)
      .single();

    const newEarnings = (currentUser?.earned || 0) + basePriceUSDC;

    await supabase
      .from("User")
      .update({ earned: newEarnings })
      .eq("id", artist.id);

    // Update image purchase count
    const { data: currentImage } = await supabase
      .from("Image")
      .select("noOfPeopleBought")
      .eq("id", image.id)
      .single();

    const newPurchaseCount = (currentImage?.noOfPeopleBought || 0) + 1;

    await supabase
      .from("Image")
      .update({ noOfPeopleBought: newPurchaseCount })
      .eq("id", image.id);

    // Return image metadata + URL for agent consumption
    return NextResponse.json(
      {
        success: true,
        transaction: {
          hash: paymentHash || `agent_tx_${Date.now()}`,
          amount: basePriceUSDC,
          currency: "USDC",
          network: "solana-devnet",
        },
        image: {
          id: image.id,
          title: image.title,
          url: image.url,
          price: image.price,
          format: "high-resolution",
          license: "personal-use",
        },
        creator: {
          id: artist.id,
          name: artist.name,
          email: artist.email,
          earnedThisSale: basePriceUSDC,
          totalEarnings: newEarnings,
        },
        agent: {
          address: agentAddress,
          purchaseTime: new Date().toISOString(),
          totalPurchases: newPurchaseCount,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          version: "1.0",
          marketplace: "pinspire-ai-marketplace",
          useCase: "Training Data",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Agent buy endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for status/info about the agent marketplace
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const imageId = url.searchParams.get("imageId");
  const action = url.searchParams.get("action");

  if (action === "info") {
    return NextResponse.json({
      marketplace: "Pinspire AI Agent Marketplace",
      version: "1.0",
      currency: "USDC",
      network: "solana-devnet",
      pricePerImage: "$0.01",
      features: [
        "Autonomous agent purchasing",
        "Instant payment settlement",
        "Real-time creator payouts",
        "Referral support",
        "Dataset licensing",
      ],
      endpoints: {
        buy: "POST /api/agent/buy?imageId=123",
        info: "GET /api/agent/buy?action=info",
        image: "GET /api/agent/buy?imageId=123&action=image-info",
      },
    });
  }

  if (action === "image-info" && imageId) {
    try {
      const { data: image, error } = await supabase
        .from("Image")
        .select("*")
        .eq("id", parseInt(imageId))
        .single();

      if (error || !image) {
        return NextResponse.json(
          { error: "Image not found" },
          { status: 404 }
        );
      }

      const { data: artist } = await supabase
        .from("User")
        .select("name, email")
        .eq("id", image.ownerId)
        .single();

      return NextResponse.json({
        image: {
          id: image.id,
          title: image.title,
          price: image.price,
          format: "high-resolution",
          purchases: image.noOfPeopleBought || 0,
          creator: artist?.name || "Unknown",
        },
        purchaseMethod: "POST /api/agent/buy?imageId=" + imageId,
        paymentRequired: true,
        amount: "$0.01 USDC",
      });
    } catch (error) {
      console.log(error)
      return NextResponse.json(
        { error: "Failed to fetch image info" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({
    message: "AI Agent Marketplace API",
    usage: "POST /api/agent/buy?imageId=123",
    info: "GET /api/agent/buy?action=info",
  });
}
