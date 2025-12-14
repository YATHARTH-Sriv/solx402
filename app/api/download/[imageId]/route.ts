import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;
    
    // Fetch image with owner info
    const { data: image, error } = await supabase
      .from("Image")
      .select("*, User(name, addressToReceive)")
      .eq("id", parseInt(imageId))
      .single();

    if (error || !image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: image.id,
      title: image.title,
      price: image.price,
      url: image.url,
      payTo: image.User?.addressToReceive,
      ownerName: image.User?.name,
    });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  try {
    const { imageId } = await params;
    const body = await request.json();
    const { userId, txnHash, pricePaid } = body;

    if (!userId || !txnHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("Purchase")
      .select("id")
      .eq("userId", userId)
      .eq("imageId", parseInt(imageId))
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 });
    }

    const { data: image } = await supabase
      .from("Image")
      .select("ownerId, price, noOfPeopleBought")
      .eq("id", parseInt(imageId))
      .single();

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    const { error: purchaseError } = await supabase.from("Purchase").insert([
      {
        userId,
        imageId: parseInt(imageId),
        pricePaid: pricePaid || image.price,
        txnHash,
        createdAt: new Date().toISOString(),
      },
    ]);

    if (purchaseError) {
      console.error("Purchase error:", purchaseError);
      return NextResponse.json({ error: purchaseError.message }, { status: 500 });
    }

    await supabase
      .from("Image")
      .update({ noOfPeopleBought: (image.noOfPeopleBought || 0) + 1 })
      .eq("id", parseInt(imageId));

    const { data: owner } = await supabase
      .from("User")
      .select("earned, txnHashes")
      .eq("id", image.ownerId)
      .single();

    if (owner) {
      await supabase
        .from("User")
        .update({ 
          earned: (parseFloat(owner.earned) || 0) + parseFloat(image.price),
          txnHashes: [...(owner.txnHashes || []), txnHash]
        })
        .eq("id", image.ownerId);
    }

    return NextResponse.json({ success: true, message: "Purchase recorded" });
  } catch (err) {
    console.error("Error recording purchase:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
