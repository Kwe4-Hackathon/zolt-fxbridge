// app/api/banks/validate/route.ts
import { resolveAccountNumber } from "@/lib/paystack";
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

		try {
			const result = await resolveAccountNumber(bankCode, accountNumber);

			return NextResponse.json({
				success: true,
				accountName: result.accountName,
				accountNumber: result.accountNumber,
				bankCode: result.bankCode,
			});
		} catch (error: any) {
			console.error("Name enquiry error:", error);
			return NextResponse.json(
				{ error: error.message || "Account validation failed" },
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
