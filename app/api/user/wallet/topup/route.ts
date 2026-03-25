// app/api/wallet/topup/route.ts
import { connectDB } from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const session = await getServerSession();
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { amount } = await req.json();

		if (!amount || amount <= 0) {
			return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
		}

		await connectDB();

		// Generate unique transaction reference
		const txnRef = `TOPUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

		// Using Interswitch test credentials
		return NextResponse.json({
			txnRef: txnRef,
			merchantCode: process.env.INTERSWITCH_MERCHANT_CODE || "MX6072",
			payItemId: process.env.INTERSWITCH_PAY_ITEM_ID || "9405967",
			amount: Math.round(amount * 100), // Convert to Kobo
			currency: 566, // NGN
		});
	} catch (error) {
		console.error("Topup initialization error:", error);
		return NextResponse.json(
			{ error: "Initialization failed" },
			{ status: 500 },
		);
	}
}
