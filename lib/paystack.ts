// lib/paystack.ts
import crypto from "crypto";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL =
	process.env.PAYSTACK_ENV === "production"
		? "https://api.paystack.co"
		: "https://api.paystack.co"; // Same URL for both, use test keys for sandbox

// Generate Paystack signature for webhook verification
export function verifyPaystackSignature(
	signature: string,
	payload: string,
): boolean {
	const hash = crypto
		.createHmac("sha512", PAYSTACK_SECRET)
		.update(payload)
		.digest("hex");
	return hash === signature;
}

// Initialize a transaction (for top-up)
export async function initializeTransaction(params: {
	email: string;
	amount: number;
	reference?: string;
	callbackUrl?: string; // Add this
	metadata?: Record<string, any>;
}) {
	const payload: any = {
		email: params.email,
		amount: params.amount,
		reference: params.reference,
		metadata: params.metadata,
	};

	// Add callback_url if provided
	if (params.callbackUrl) {
		payload.callback_url = params.callbackUrl;
	}

	const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	const data = await response.json();

	if (!response.ok || !data.status) {
		throw new Error(data.message || "Failed to initialize transaction");
	}

	return data.data;
}

// Verify transaction (after payment)
export async function verifyTransaction(reference: string) {
	const response = await fetch(
		`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${PAYSTACK_SECRET}`,
				"Content-Type": "application/json",
			},
		},
	);

	const data = await response.json();

	if (!response.ok || !data.status) {
		throw new Error(data.message || "Failed to verify transaction");
	}

	return data.data;
}

// Get all banks for Nigerian transfers
export async function getBanks() {
	const response = await fetch(`${PAYSTACK_BASE_URL}/bank`, {
		method: "GET",
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET}`,
			"Content-Type": "application/json",
		},
	});

	const data = await response.json();

	if (!response.ok || !data.status) {
		throw new Error(data.message || "Failed to fetch banks");
	}

	return data.data;
}

// Resolve account number (name enquiry)
export async function resolveAccountNumber(
	bankCode: string,
	accountNumber: string,
) {
	const response = await fetch(
		`${PAYSTACK_BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
		{
			method: "GET",
			headers: {
				Authorization: `Bearer ${PAYSTACK_SECRET}`,
				"Content-Type": "application/json",
			},
		},
	);

	const data = await response.json();

	if (!response.ok || !data.status) {
		throw new Error(data.message || "Failed to resolve account");
	}

	return {
		accountName: data.data.account_name,
		accountNumber: data.data.account_number,
		bankCode: bankCode,
	};
}

// lib/paystack.ts - Add createTransferRecipient function

// Create a transfer recipient (beneficiary)
export async function createTransferRecipient(params: {
	type: string;
	name: string;
	account_number: string;
	bank_code: string;
	currency?: string;
}) {
	const response = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			type: params.type || "nuban",
			name: params.name,
			account_number: params.account_number,
			bank_code: params.bank_code,
			currency: params.currency || "NGN",
		}),
	});

	const data = await response.json();

	if (!response.ok || !data.status) {
		throw new Error(data.message || "Failed to create transfer recipient");
	}

	return data.data; // Returns recipient_code
}

// Initiate a transfer using recipient code
export async function initiateTransfer(params: {
	source: string;
	amount: number;
	recipient: string; // recipient_code
	reason?: string;
	reference: string;
}) {
	const response = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${PAYSTACK_SECRET}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			source: params.source,
			amount: params.amount,
			recipient: params.recipient,
			reason: params.reason,
			reference: params.reference,
		}),
	});

	const data = await response.json();

	if (!response.ok || !data.status) {
		throw new Error(data.message || "Failed to initiate transfer");
	}

	return data.data;
}

// Get bank code from bank name (helper)
export function getBankCode(bankName: string, banks: any[]): string | null {
	const bank = banks.find(
		(b) => b.name.toLowerCase() === bankName.toLowerCase(),
	);
	return bank?.code || null;
}
