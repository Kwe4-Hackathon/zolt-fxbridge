// app/api/wallet/verify/route.ts
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const session = await getServerSession();
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { txnRef, amount } = await req.json();

		await connectDB();

		// In production, you would verify with Interswitch API here
		// For demo, we'll simulate successful verification

		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Add balance
		user.ngnBalance += amount;

		// Record transaction
		user.transactions.push({
			txnId: txnRef,
			recipient: "Self (Wallet Top-up)",
			amountNgn: amount,
			amountUsd: amount / 1500,
			rate: 1500,
			status: "Completed",
			createdAt: new Date(),
		});

		await user.save();

		return NextResponse.json({
			success: true,
			newBalance: user.ngnBalance,
		});
	} catch (error) {
		console.error("Verification error:", error);
		return NextResponse.json({ error: "Verification failed" }, { status: 500 });
	}
}
