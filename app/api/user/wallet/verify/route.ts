// app/api/user/wallet/verify/route.ts
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const session = await getServerSession();
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { reference } = await req.json();

		if (!reference) {
			return NextResponse.json(
				{ error: "Reference required" },
				{ status: 400 },
			);
		}

		const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;
		const response = await fetch(
			`https://api.paystack.co/transaction/verify/${reference}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bearer ${PAYSTACK_SECRET}`,
					"Content-Type": "application/json",
				},
			},
		);

		const data = await response.json();

		if (!data.status || data.data.status !== "success") {
			return NextResponse.json(
				{ error: "Transaction not successful", status: data.data?.status },
				{ status: 400 },
			);
		}

		const amountNgn = data.data.amount / 100;
		const txnId = data.data.reference;

		await connectDB();

		const updatedUser = await User.findOneAndUpdate(
			{ email: session.user.email },
			{
				$inc: { ngnBalance: amountNgn },
				$push: {
					transactions: {
						txnId: txnId,
						type: "credit",
						recipient: "Wallet Top-up",
						amountNgn: amountNgn,
						amountUsd: 0,
						status: "completed",
						description: `Wallet top-up of ₦${amountNgn.toLocaleString()} via Paystack`,
						reference: reference,
						createdAt: new Date(),
					},
				},
			},
			{ new: true },
		);

		if (!updatedUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			newBalance: updatedUser.ngnBalance,
			amount: amountNgn,
		});
	} catch (error: any) {
		console.error("Verification error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to verify transaction" },
			{ status: 500 },
		);
	}
}
