// app/api/user/wallet/topup/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const session = await getServerSession();
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { amount, email, name } = await req.json();

		if (!amount || amount < 100) {
			return NextResponse.json(
				{ error: "Minimum amount is ₦100" },
				{ status: 400 },
			);
		}

		const reference = `ZLT-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

		return NextResponse.json({
			success: true,
			reference: reference,
			amount: amount * 100,
			amountNgn: amount,
		});
	} catch (error: any) {
		console.error("Topup error:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to initialize payment" },
			{ status: 500 },
		);
	}
}
