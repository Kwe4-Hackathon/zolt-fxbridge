// app/api/transfer/route.ts (Updated)
import { getInterswitchHeaders } from "@/lib/interswitch";
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

		const { beneficiary, amountNgn } = await req.json();
		const txnId = `ZLT-${Math.floor(100000 + Math.random() * 900000)}`;
		const SERVICE_FEE = 12000;

		await connectDB();

		// Get user with locked rate
		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Check if there's a locked rate
		const lockedRate = user.lockedRate;
		if (!lockedRate || lockedRate.expiresAt < new Date()) {
			return NextResponse.json(
				{ error: "No valid locked rate found. Please lock a rate first." },
				{ status: 400 },
			);
		}

		// Check if amount matches locked amount
		if (amountNgn !== lockedRate.amountNgn) {
			return NextResponse.json(
				{ error: "Amount doesn't match locked rate amount" },
				{ status: 400 },
			);
		}

		// Check balance
		if (user.ngnBalance < amountNgn) {
			return NextResponse.json(
				{ error: "Insufficient wallet balance" },
				{ status: 400 },
			);
		}

		// Prepare Interswitch Disbursement (Simulated)
		const url =
			"https://sandbox.interswitchng.com/api/v2/disbursements/transfers";
		const headers = getInterswitchHeaders("POST", url);

		// Simulate Interswitch success for hackathon
		const interswitchSuccess = true;

		if (!interswitchSuccess) {
			throw new Error("Interswitch Gateway Timeout");
		}

		// Calculate final USD Value
		const amountUsd = (amountNgn - SERVICE_FEE) / lockedRate.rate;

		// Atomic Update: Deduct balance, add transaction, clear locked rate
		const updatedUser = await User.findOneAndUpdate(
			{ email: session.user.email },
			{
				$inc: { ngnBalance: -amountNgn },
				$push: {
					transactions: {
						txnId,
						recipient: beneficiary.name,
						bankName: beneficiary.bankName,
						accountNumber: beneficiary.account,
						amountNgn,
						amountUsd: parseFloat(amountUsd.toFixed(2)),
						rate: lockedRate.rate,
						status: "Completed",
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
			message: "Transfer successful",
			newBalance: updatedUser.ngnBalance,
		});
	} catch (error: any) {
		console.error("Transfer Route Error:", error.message);
		return NextResponse.json(
			{ error: error.message || "Internal Transfer Failure" },
			{ status: 500 },
		);
	}
}
