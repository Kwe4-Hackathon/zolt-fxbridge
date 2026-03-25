// app/api/rate-lock/route.ts
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

		await connectDB();
		const body = await req.json();
		const { rate, amountNgn } = body;

		if (!rate || !amountNgn) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Calculate final USD for the record
		const serviceFee = 12000;
		const amountUsd = (amountNgn - serviceFee) / rate;

		// Update user with locked rate
		const user = await User.findOneAndUpdate(
			{ email: session.user.email },
			{
				lockedRate: {
					rate: rate,
					amountNgn: amountNgn,
					amountUsd: parseFloat(amountUsd.toFixed(2)),
					expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
					currencyPair: "NGN/USD",
				},
			},
			{ new: true },
		);

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(
			{
				success: true,
				message: "Rate secured successfully",
				lockedRate: user.lockedRate,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Lock Rate Error:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 },
		);
	}
}
