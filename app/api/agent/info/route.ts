import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * AI Agent Info Endpoint - No payment required
 * Provides marketplace information and image details for AI agents to discover
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const imageId = url.searchParams.get("imageId");
  const action = url.searchParams.get("action");

  // Get specific image info (check first so imageId takes priority)
  if (imageId) {
    try {
      const { data: image, error } = await supabase
        .from("Image")
        .select("*")
        .eq("id", parseInt(imageId))
        .single();

      if (error || !image) {
        return NextResponse.json(
          { error: "Image not found", imageId },
          { status: 404 }
        );
      }

      const { data: artist } = await supabase
        .from("User")
        .select("name, email")
        .eq("id", image.ownerId)
        .single();

      return NextResponse.json({
        success: true,
        image: {
          id: image.id,
          title: image.title,
          price: image.price || 0.01,
          format: "high-resolution",
          purchases: image.noOfPeopleBought || 0,
          creator: artist?.name || "Unknown Artist",
        },
        purchase: {
          method: "POST",
          endpoint: `/api/agent/buy?imageId=${imageId}`,
          paymentRequired: true,
          amount: "$0.01 USDC",
          network: "solana-devnet",
        },
      });
    } catch (error) {
        console.log(error)
      return NextResponse.json(
        { error: "Failed to fetch image info" },
        { status: 500 }
      );
    }
  }

  // Browse available images
  if (action === "browse") {
    try {
      const { data: images, error } = await supabase
        .from("Image")
        .select("id, title, price, noOfPeopleBought, ownerId")
        .limit(20);

      if (error) {
        return NextResponse.json(
          { error: "Failed to fetch images" },
          { status: 500 }
        );
      }

      const formattedImages = images?.map(img => ({
        id: img.id,
        title: img.title,
        price: img.price || 0.01,
        purchases: img.noOfPeopleBought || 0,
        buyEndpoint: `POST /api/agent/buy?imageId=${img.id}`,
      })) || [];

      return NextResponse.json({
        success: true,
        totalImages: formattedImages.length,
        images: formattedImages,
        nextStep: "Use POST /api/agent/buy?imageId=X to purchase",
      });
    } catch (error) {
        console.log(error)
      return NextResponse.json(
        { error: "Failed to browse images" },
        { status: 500 }
      );
    }
  }

  // Default: Return marketplace info
  return NextResponse.json({
    marketplace: "Pinspire AI Agent Marketplace",
    version: "1.0",
    currency: "USDC",
    network: "solana-devnet",
    pricePerImage: "$0.01",
    features: [
      "Autonomous agent purchasing",
      "Instant payment settlement via x402",
      "Real-time creator payouts",
      "Referral support",
      "Training dataset licensing",
    ],
    endpoints: {
      info: "GET /api/agent/info",
      imageInfo: "GET /api/agent/info?imageId=123",
      browse: "GET /api/agent/info?action=browse",
      buy: "POST /api/agent/buy?imageId=123 (requires x402 payment)",
    },
    howItWorks: [
      "1. Query this endpoint to discover available images",
      "2. GET /api/agent/info?imageId=X to get specific image details",
      "3. POST /api/agent/buy?imageId=X to initiate purchase",
      "4. Receive 402 response with x402 payment challenge",
      "5. Complete Solana payment and retry with payment proof",
      "6. Receive image URL and metadata upon successful payment",
    ],
  });
}
