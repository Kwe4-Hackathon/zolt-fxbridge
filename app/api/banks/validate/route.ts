// app/api/banks/validate/route.ts
import { nameEnquiry } from "@/lib/interswitch-v5";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const session = await getServerSession();
		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { accountNumber, bankCode } = await req.json();

		if (!accountNumber || !bankCode) {
			return NextResponse.json(
				{ error: "Account number and bank code required" },
				{ status: 400 },
			);
		}

		if (!/^\d{10}$/.test(accountNumber)) {
			return NextResponse.json(
				{ error: "Invalid account number format. Must be 10 digits." },
				{ status: 400 },
			);
		}

		const result = await nameEnquiry(bankCode, accountNumber);

		if (result.success) {
			return NextResponse.json({
				success: true,
				accountName: result.accountName,
				accountNumber: result.accountNumber,
				bankCode: result.bankCode,
			});
		} else {
			return NextResponse.json(
				{ error: result.error || "Account validation failed" },
				{ status: 400 },
			);
		}
	} catch (error) {
		console.error("Validation error:", error);
		return NextResponse.json(
			{ error: "Failed to validate account" },
			{ status: 500 },
		);
	}
}
