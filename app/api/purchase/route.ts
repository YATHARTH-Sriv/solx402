import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// This route is protected by the x402 middleware
// Payment is verified before this handler is called
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const imageId = url.searchParams.get("imageId");
  const userId = url.searchParams.get("userId");
  const referrerAddress = url.searchParams.get("ref"); // Referral parameter

  if (!imageId) {
    return NextResponse.json({ error: "Image ID required" }, { status: 400 });
  }

  const { data: image, error } = await supabase
    .from("Image")
    .select("*")
    .eq("id", parseInt(imageId))
    .single();

  if (error || !image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const txnHash = request.headers.get("x-payment-hash") || `tx_${Date.now()}`;
  const basePriceUSDC = 0.01; // $0.01 in USDC

  if (userId) {
    const { data: existing } = await supabase
      .from("Purchase")
      .select("id")
      .eq("userId", parseInt(userId))
      .eq("imageId", parseInt(imageId))
      .single();

    if (!existing) {
      // Calculate split: 90% to artist, 10% to referrer (if exists)
      const artistEarnings = referrerAddress ? basePriceUSDC * 0.9 : basePriceUSDC;
      const referralEarnings = referrerAddress ? basePriceUSDC * 0.1 : 0;

      // Insert purchase with referral data
      const { error: purchaseError } = await supabase.from("Purchase").insert([
        {
          userId: parseInt(userId),
          imageId: parseInt(imageId),
          pricePaid: basePriceUSDC,
          txnHash,
          referrerAddress: referrerAddress || null,
          referralAmount: referralEarnings,
          createdAt: new Date().toISOString(),
        },
      ]);

      if (purchaseError) {
        console.error("Purchase insert error:", purchaseError);
      }

      // Update image purchase count
      await supabase
        .from("Image")
        .update({ noOfPeopleBought: (image.noOfPeopleBought || 0) + 1 })
        .eq("id", parseInt(imageId));

      // Update artist earnings
      const { data: owner } = await supabase
        .from("User")
        .select("earned, txnHashes")
        .eq("id", image.ownerId)
        .single();

      if (owner) {
        const currentEarned = parseFloat(owner.earned) || 0;
        const newEarned = currentEarned + artistEarnings;

        await supabase
          .from("User")
          .update({
            earned: newEarned.toFixed(4),
            txnHashes: [...(owner.txnHashes || []), txnHash],
          })
          .eq("id", image.ownerId);
      }

      // Update referrer earnings if applicable
      if (referrerAddress) {
        const { data: referrer } = await supabase
          .from("User")
          .select("referralEarnings")
          .eq("addressToReceive", referrerAddress)
          .single();

        if (referrer) {
          const currentReferralEarnings = parseFloat(referrer.referralEarnings) || 0;
          const newReferralEarnings = currentReferralEarnings + referralEarnings;

          await supabase
            .from("User")
            .update({
              referralEarnings: newReferralEarnings.toFixed(4),
            })
            .eq("addressToReceive", referrerAddress);
        }
      }
    }
  }

  const homeUrl = new URL("/", request.url);
  homeUrl.searchParams.set("purchased", imageId);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta http-equiv="refresh" content="3;url=${homeUrl.toString()}" />
        <title>Purchase Successful</title>
        <style>
          body {
            font-family: system-ui, -apple-system, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: #f3f4f6;
          }
          .container {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .success {
            font-size: 48px;
            margin-bottom: 1rem;
          }
          h1 {
            color: #059669;
            margin-bottom: 0.5rem;
          }
          p {
            color: #6b7280;
            margin-bottom: 0.5rem;
          }
          .countdown {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">🎉</div>
          <h1>Purchase Successful!</h1>
          <p>Redirecting you back to the gallery...</p>
          <div class="countdown" id="countdown">3</div>
        </div>
        <script>
          let count = 3;
          const countdownEl = document.getElementById('countdown');

          const interval = setInterval(() => {
            count--;
            if (count > 0) {
              countdownEl.textContent = count;
            } else {
              clearInterval(interval);
            }
          }, 1000);

          setTimeout(() => {
            window.location.href = "${homeUrl.toString()}";
          }, 3000);
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
