// app/api/banks/route.ts
import { getBanks } from "@/lib/interswitch-v5";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
	try {
		const session = await getServerSession();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const banks = await getBanks();

		return NextResponse.json({
			success: true,
			banks: banks,
		});
	} catch (error: any) {
		console.error("Error fetching banks:", error);
		return NextResponse.json(
			{ error: error.message || "Failed to fetch banks" },
			{ status: 500 },
		);
	}
}
