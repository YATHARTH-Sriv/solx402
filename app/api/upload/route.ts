import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const ownerId = formData.get("ownerId") as string;

    if (!file || !title || !ownerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    
    const blob = await put(file.name, file, {
      access: "public",
    });

    
    const { data, error } = await supabase.from("Image").insert([
      {
        title,
        price: 0.01,
        url: blob.url,
        ownerId: parseInt(ownerId),
        noOfPeopleBought: 0,
        createdAt: new Date().toISOString(),
      },
    ]).select();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, image: data?.[0] });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
