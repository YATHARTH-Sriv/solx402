import { NextRequest, NextResponse } from "next/server";
import { 
  Connection, 
  PublicKey, 
  Keypair,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { createClient } from "@supabase/supabase-js";
import bs58 from "bs58";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// USDC on Solana Devnet (use proper mint for mainnet)
const USDC_MINT = new PublicKey(
  process.env.NEXT_PUBLIC_NETWORK === "solana-mainnet-beta"
    ? "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" // Mainnet USDC
    : "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU" // Devnet USDC (example)
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const { data: user, error: userError } = await supabase
      .from("User")
      .select("*")
      .eq("id", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const earned = parseFloat(user.earned) || 0;
    if (earned <= 0) {
      return NextResponse.json({ error: "No earnings to claim" }, { status: 400 });
    }

    // Validate Solana address
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(user.addressToReceive);
    } catch {
      return NextResponse.json({ error: "Invalid Solana wallet address" }, { status: 400 });
    }

    // Get sender wallet from private key
    const senderPrivateKey = process.env.RESOURCE_WALLET_PRIVATE_KEY;
    if (!senderPrivateKey) {
      return NextResponse.json({ error: "Server wallet not configured" }, { status: 500 });
    }

    let senderKeypair: Keypair;
    try {
      // Try to parse as base58
      senderKeypair = Keypair.fromSecretKey(bs58.decode(senderPrivateKey));
    } catch {
      // Try to parse as JSON array
      try {
        const secretKey = JSON.parse(senderPrivateKey);
        senderKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey));
      } catch {
        return NextResponse.json({ error: "Invalid server wallet key format" }, { status: 500 });
      }
    }

    // Connect to Solana
    const network = process.env.NEXT_PUBLIC_NETWORK === "solana-mainnet-beta" 
      ? "https://api.mainnet-beta.solana.com"
      : "https://api.devnet.solana.com";
    
    const connection = new Connection(network, "confirmed");

    // Get token accounts
    const senderTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      senderKeypair.publicKey
    );

    const recipientTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      recipientPubkey
    );

    // USDC has 6 decimals
    const amount = Math.floor(earned * 1_000_000);

    // Check sender balance
    try {
      const balance = await connection.getTokenAccountBalance(senderTokenAccount);
      if (parseInt(balance.value.amount) < amount) {
        return NextResponse.json({ 
          error: "Insufficient USDC balance in treasury" 
        }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ 
        error: "Treasury token account not found" 
      }, { status: 500 });
    }

    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      senderTokenAccount,
      recipientTokenAccount,
      senderKeypair.publicKey,
      amount,
      [],
      TOKEN_PROGRAM_ID
    );

    // Build and send transaction
    const transaction = new Transaction().add(transferInstruction);
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = senderKeypair.publicKey;

    // Sign and send
    transaction.sign(senderKeypair);
    const signature = await connection.sendRawTransaction(transaction.serialize());

    // Wait for confirmation
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    // Update user's earnings and add transaction hash
    await supabase
      .from("User")
      .update({
        earned: 0,
        txnHashes: [...(user.txnHashes || []), signature],
      })
      .eq("id", userId);

    return NextResponse.json({
      success: true,
      txnHash: signature,
      amount: earned,
      explorerUrl: process.env.NEXT_PUBLIC_NETWORK === "solana-mainnet-beta"
        ? `https://explorer.solana.com/tx/${signature}`
        : `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
    });
  } catch (error) {
    console.error("Claim error:", error);
    return NextResponse.json(
      { error: "Failed to process claim: " + (error as Error).message },
      { status: 500 }
    );
  }
}
