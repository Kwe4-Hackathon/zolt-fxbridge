// app/api/transactions/transfer/route.ts
import { transferFunds } from "@/lib/interswitch-v5";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const session = await getServerSession();
		if (!session || !session.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { beneficiary, amountNgn } = await req.json();

		if (!beneficiary || !amountNgn || amountNgn <= 0) {
			return NextResponse.json({ error: "Invalid request" }, { status: 400 });
		}

		await connectDB();
		const user = await User.findOne({ email: session.user.email });

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Validate locked rate
		const lockedRate = user.lockedRate;
		if (!lockedRate || lockedRate.expiresAt < new Date()) {
			return NextResponse.json(
				{ error: "No valid locked rate found" },
				{ status: 400 },
			);
		}

		if (user.ngnBalance < amountNgn) {
			return NextResponse.json(
				{ error: "Insufficient balance" },
				{ status: 400 },
			);
		}

		const txnId = `ZLT-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;
		const SERVICE_FEE = 12000;

		try {
			// Process transfer via Interswitch v5 API
			const transferResult = await transferFunds({
				amount: amountNgn * 100, // Convert to kobo
				bankCode: beneficiary.bankCode,
				accountNumber: beneficiary.accountNumber,
				accountName: beneficiary.name,
				narration: beneficiary.narration || "FXB Transfer",
				transactionReference: txnId,
			});

			const amountUsd = (amountNgn - SERVICE_FEE) / lockedRate.rate;

			// Update user balance and record transaction
			const updatedUser = await User.findOneAndUpdate(
				{ email: session.user.email },
				{
					$inc: { ngnBalance: -amountNgn },
					$push: {
						transactions: {
							txnId,
							type: "debit",
							recipient: beneficiary.name,
							recipientAccount: beneficiary.accountNumber,
							bankCode: beneficiary.bankCode,
							amountNgn,
							amountUsd: parseFloat(amountUsd.toFixed(2)),
							serviceFee: SERVICE_FEE,
							rate: lockedRate.rate,
							status: "completed",
							reference: transferResult.transactionReference || txnId,
							narration: beneficiary.narration,
							createdAt: new Date(),
						},
					},
					$unset: { lockedRate: "" },
				},
				{ new: true },
			);

			return NextResponse.json({
				success: true,
				txnId,
				reference: transferResult.transactionReference,
				message: "Transfer successful",
				newBalance: updatedUser?.ngnBalance,
			});
		} catch (error: any) {
			console.error("Transfer error:", error);
			return NextResponse.json(
				{ error: error.message || "Transfer processing failed" },
				{ status: 502 },
			);
		}
	} catch (error: any) {
		console.error("API error:", error);
		return NextResponse.json(
			{ error: error.message || "Internal server error" },
			{ status: 500 },
		);
	}
}
