// app/api/transactions/transfer/route.ts
import { connectDB } from "@/lib/mongodb";
import {
	createTransferRecipient,
	getBanks,
	initiateTransfer,
	resolveAccountNumber,
} from "@/lib/paystack";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Helper function to match bank names
function findBankCode(banks: any[], bankName: string): string | null {
	let bank = banks.find((b) => b.name === bankName);
	if (bank) return bank.code;

	bank = banks.find((b) => b.name.toLowerCase() === bankName.toLowerCase());
	if (bank) return bank.code;

	const searchName = bankName.toLowerCase();

	const bankMappings: Record<string, string[]> = {
		"058": ["gtbank", "guaranty trust bank", "gt bank"],
		"057": ["zenith", "zenith bank"],
		"033": ["uba", "united bank for africa", "united bank"],
		"044": ["access", "access bank"],
		"011": ["first bank", "first bank of nigeria", "first"],
		"070": ["fidelity", "fidelity bank"],
		"076": ["polaris", "polaris bank"],
		"221": ["stanbic", "stanbic ibtc"],
		"032": ["union", "union bank"],
		"035": ["wema", "wema bank"],
		"232": ["sterling", "sterling bank"],
		"082": ["keystone", "keystone bank"],
		"030": ["heritage", "heritage bank"],
		"214": ["fcmb", "first city monument bank"],
		"301": ["jaiz", "jaiz bank"],
		"101": ["providus", "providus bank"],
		"102": ["titan", "titan trust bank"],
		"103": ["globus", "globus bank"],
		"100": ["suntrust", "suntrust bank"],
		"215": ["unity", "unity bank"],
		"090267": ["kuda", "kuda bank"],
	};

	for (const [code, keywords] of Object.entries(bankMappings)) {
		if (keywords.some((keyword) => searchName.includes(keyword))) {
			return code;
		}
	}

	bank = banks.find(
		(b) =>
			b.name.toLowerCase().includes(searchName) ||
			searchName.includes(b.name.toLowerCase()),
	);
	if (bank) return bank.code;

	return null;
}

export async function POST(req: Request) {
	try {
		const session = await getServerSession();
		if (!session?.user?.email) {
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

		const txnId = `ZLT-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
		const SERVICE_FEE = 12000;

		const banks = await getBanks();
		console.log(
			"Available banks:",
			banks.slice(0, 5).map((b: any) => ({ code: b.code, name: b.name })),
		);

		const bankCode = findBankCode(banks, beneficiary.bankName);

		if (!bankCode) {
			console.error(`Bank not found for: ${beneficiary.bankName}`);
			return NextResponse.json(
				{
					error: `Bank "${beneficiary.bankName}" not found. Please select from the list.`,
				},
				{ status: 400 },
			);
		}

		console.log(`Matched "${beneficiary.bankName}" to bank code: ${bankCode}`);

		const accountValidation = await resolveAccountNumber(
			bankCode,
			beneficiary.accountNumber,
		);

		if (!accountValidation) {
			return NextResponse.json(
				{ error: "Invalid account number" },
				{ status: 400 },
			);
		}

		console.log("Account validated:", accountValidation);

		try {
			const recipient = await createTransferRecipient({
				type: "nuban",
				name: accountValidation.accountName,
				account_number: beneficiary.accountNumber,
				bank_code: bankCode,
				currency: "NGN",
			});

			console.log("Transfer recipient created:", recipient.recipient_code);

			const transfer = await initiateTransfer({
				source: "balance",
				amount: amountNgn * 100,
				recipient: recipient.recipient_code,
				reason: beneficiary.narration || "Zolt Transfer",
				reference: txnId,
			});

			console.log("Transfer initiated:", transfer);

			const amountUsd = (amountNgn - SERVICE_FEE) / lockedRate.rate;

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
							bankName: beneficiary.bankName,
							bankCode: bankCode,
							amountNgn,
							amountUsd: parseFloat(amountUsd.toFixed(2)),
							serviceFee: SERVICE_FEE,
							rate: lockedRate.rate,
							status: "completed",
							reference: transfer.reference,
							transferCode: transfer.transfer_code,
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
				reference: transfer.reference,
				transferCode: transfer.transfer_code,
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
