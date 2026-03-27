// app/api/transfer/route.ts
import { getAuthHeader, interswitchClient } from "@/lib/interswitch";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Rate configuration (you might want to fetch this from an API or database)
const USD_NGN_RATE = 1500;

// Validation function for recipient data
function validateRecipientData(data: any) {
	const requiredFields = ["bankCode", "accountNumber", "name", "narration"];
	const missingFields = requiredFields.filter((field) => !data[field]);

	if (missingFields.length > 0) {
		throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
	}

	// Validate account number length (Nigeria: 10 digits)
	if (!/^\d{10}$/.test(data.accountNumber)) {
		throw new Error("Invalid account number format");
	}

	return true;
}

export async function POST(req: Request) {
	try {
		// 1. Authentication
		const session = await getServerSession();
		if (!session || !session.user?.id) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// 2. Parse and validate request body
		const { amountNgn, recipientData } = await req.json();

		if (!amountNgn || amountNgn <= 0) {
			return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
		}

		if (!recipientData) {
			return NextResponse.json(
				{ error: "Recipient data required" },
				{ status: 400 },
			);
		}

		// Validate recipient data
		try {
			validateRecipientData(recipientData);
		} catch (validationError: any) {
			return NextResponse.json(
				{ error: validationError.message },
				{ status: 400 },
			);
		}

		// 3. Database connection and user validation
		await connectDB();
		const user = await User.findById(session.user.id);

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Check sufficient balance
		if (user.ngnBalance < amountNgn) {
			return NextResponse.json(
				{ error: "Insufficient balance" },
				{ status: 400 },
			);
		}

		// Generate transaction ID
		const txnId = `FXB-${Date.now()}-${Math.floor(Math.random() * 90000 + 10000)}`;

		// 4. Process Interswitch Transfer
		let interswitchResponse;
		try {
			const transferPayload = {
				amount: amountNgn * 100,
				terminalId: "3PBP0001",
				paymentItemCode: "01",
				beneficiaryBankCode: recipientData.bankCode,
				beneficiaryAccountNumber: recipientData.accountNumber,
				beneficiaryName: recipientData.name,
				transactionReference: txnId,
				narration: recipientData.narration || "FXB Transfer",
				currencyCode: "566",
			};

			const headers = getAuthHeader("POST", "/payment/v1/transfers");
			interswitchResponse = await interswitchClient.post(
				"/payment/v1/transfers",
				transferPayload,
				headers,
			);

			if (!interswitchResponse || interswitchResponse.responseCode !== "00") {
				throw new Error(
					interswitchResponse?.responseMessage || "Transfer failed",
				);
			}
		} catch (error: any) {
			console.error("Interswitch transfer error:", error);
			return NextResponse.json(
				{
					error: "Transfer processing failed",
					details: error.data?.responseMessage || error.message,
				},
				{ status: 502 },
			);
		}

		const amountUsd = amountNgn / USD_NGN_RATE;

		const updatedUser = await User.findByIdAndUpdate(
			session.user.id,
			{
				$inc: { ngnBalance: -amountNgn },
				$push: {
					transactions: {
						txnId,
						type: "debit",
						recipient: recipientData.name,
						recipientAccount: recipientData.accountNumber,
						recipientBank: recipientData.bankCode,
						amountNgn,
						amountUsd,
						rate: USD_NGN_RATE,
						status: "completed",
						reference: interswitchResponse?.transactionReference || txnId,
						narration: recipientData.narration,
						date: new Date(),
					},
				},
			},
			{ new: true },
		);

		if (!updatedUser) {
			console.error("Failed to update user balance after successful transfer", {
				userId: session.user.id,
				txnId,
				amountNgn,
			});
			return NextResponse.json(
				{ error: "Transaction recorded but balance update failed" },
				{ status: 500 },
			);
		}

		return NextResponse.json({
			success: true,
			txnId,
			reference: interswitchResponse?.transactionReference,
			amountNgn,
			amountUsd,
			rate: USD_NGN_RATE,
			newBalance: updatedUser.ngnBalance,
			transactionDate: new Date().toISOString(),
		});
	} catch (error: any) {
		console.error("Transfer API error:", error);
		return NextResponse.json(
			{ error: error.message || "Internal server error" },
			{ status: 500 },
		);
	}
}
