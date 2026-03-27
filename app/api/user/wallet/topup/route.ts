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

		const txnRef = `TOPUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

		return NextResponse.json({
			txnRef,
			merchantCode: "MX180436",
			payItemId: "Default_Payable_MX180436",
			amount: Math.round(amount * 100),
			currency: 566,
		});
	} catch (error) {
		console.error("Topup initialization error:", error);
		return NextResponse.json(
			{ error: "Initialization failed" },
			{ status: 500 },
		);
	}
}
