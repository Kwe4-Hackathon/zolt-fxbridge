// lib/interswitch-v5.ts
import crypto from "crypto";

// Environment configuration
const IS_SANDBOX = process.env.INTERSWITCH_ENV !== "production";
const IS_QA = process.env.INTERSWITCH_ENV === "qa";

// Base URLs - Quickteller v5 uses a different base
const QUICKTELLER_BASE_URL = IS_SANDBOX
	? "https://sandbox.interswitchng.com/quicktellerservice/api/v5"
	: "https://api.interswitchng.com/quicktellerservice/api/v5";

// For QA environment (if needed)
const QA_BASE_URL = "https://qa.interswitchng.com/quicktellerservice/api/v5";

// Choose the appropriate base URL
const BASE_URL = IS_QA ? QA_BASE_URL : QUICKTELLER_BASE_URL;

// Your credentials (should be in environment variables)
const CLIENT_ID =
	process.env.NEXT_PUBLIC_INTERSWITCH_CLIENT_ID ||
	"IKIAA62431120A351902376A7B7E8B2C477E7CB9A571";
const SECRET_KEY =
	process.env.NEXT_PUBLIC_INTERSWITCH_SECRET_KEY || "WAWhdpCiNn9bBLf";

// Get all banks (NIBSS bank list)
export async function getBanks() {
	const endpoint = "/configuration/fundstransferbanks";
	const headers = getQuicktellerHeaders("GET", endpoint);

	console.log("Fetching banks from:", `${BASE_URL}${endpoint}`);

	const response = await fetch(`${BASE_URL}${endpoint}`, {
		method: "GET",
		headers,
	});

	console.log("Banks response status:", response.status);

	const data = await handleResponse(response);

	if (!response.ok || (data.responseCode && data.responseCode !== "00")) {
		throw new Error(
			data.responseMessage || `Failed to fetch banks: ${response.status}`,
		);
	}

	return data.banks || data;
}

export function getQuicktellerHeaders(method: string, endpoint: string) {
	const timestamp = Math.floor(Date.now() / 1000).toString();
	const nonce = crypto.randomBytes(16).toString("hex");

	const signatureString = `${method}${endpoint}${timestamp}${nonce}${CLIENT_ID}`;
	const signature = crypto
		.createHmac("sha256", SECRET_KEY)
		.update(signatureString)
		.digest("base64");

	return {
		"Content-Type": "application/json",
		Accept: "application/json",
		"User-Agent": "Zolt/1.0",
		ClientId: CLIENT_ID,
		Timestamp: timestamp,
		Nonce: nonce,
		Signature: signature,
		SignatureMethod: "SHA256",
	};
}

async function handleResponse(response: Response) {
	const contentType = response.headers.get("content-type");

	if (!contentType || !contentType.includes("application/json")) {
		const text = await response.text();
		console.error("Non-JSON response:", {
			status: response.status,
			body: text.substring(0, 200),
		});

		if (text.includes("<!DOCTYPE") || text.includes("<html")) {
			throw new Error(`API returned error page (${response.status})`);
		}

		throw new Error(`Invalid response format`);
	}

	return await response.json();
}

function getBasicAuthHeader() {
	const credentials = `${CLIENT_ID}:${SECRET_KEY}`;
	const encoded = Buffer.from(credentials).toString("base64");
	return `Basic ${encoded}`;
}

export async function nameEnquiry(bankCode: string, accountNumber: string) {
	const endpoint = "/Transactions/DoAccountNameInquiry";
	const fullUrl = `${BASE_URL}${endpoint}`;

	const payload = {
		TerminalID: "3PBP0001",
		accountid: accountNumber,
		bankcode: bankCode,
	};

	console.log("Name enquiry request:", {
		url: fullUrl,
		payload,
		auth: "Basic Auth with Client ID",
	});

	try {
		const response = await fetch(fullUrl, {
			method: "POST",
			headers: {
				Authorization: getBasicAuthHeader(),
				"Content-Type": "application/json",
				Accept: "application/json",
			},
			body: JSON.stringify(payload),
		});

		console.log("Name enquiry response status:", response.status);

		const data = await response.json();
		console.log("Name enquiry response:", data);

		if (
			response.ok &&
			(data.responseCode === "00" || data.ResponseCode === "00")
		) {
			return {
				success: true,
				accountName:
					data.accountName || data.AccountName || data.beneficiaryName,
				accountNumber: accountNumber,
				bankCode: bankCode,
			};
		}

		return {
			success: false,
			error:
				data.responseMessage ||
				data.ResponseDescription ||
				"Account validation failed",
		};
	} catch (error: any) {
		console.error("Name enquiry error:", error);
		return {
			success: false,
			error: error.message || "Network error",
		};
	}
}

export async function transferFunds(transferData: {
	amount: number;
	bankCode: string;
	accountNumber: string;
	accountName: string;
	narration: string;
	transactionReference: string;
}) {
	const endpoint = "/transactions/TransferFunds";
	const headers = getQuicktellerHeaders("POST", endpoint);

	const payload = {
		amount: transferData.amount,
		bankCode: transferData.bankCode,
		accountNumber: transferData.accountNumber,
		accountName: transferData.accountName,
		narration: transferData.narration,
		transactionReference: transferData.transactionReference,
		currency: "566", // NGN currency code
		paymentItemCode: "01",
		terminalId: process.env.INTERSWITCH_TERMINAL_ID || "3PBP0001",
	};

	console.log("Transfer request:", {
		url: `${BASE_URL}${endpoint}`,
		payload,
	});

	const response = await fetch(`${BASE_URL}${endpoint}`, {
		method: "POST",
		headers: headers,
		body: JSON.stringify(payload),
	});

	const data = await handleResponse(response);

	if (!response.ok || (data.responseCode && data.responseCode !== "00")) {
		throw new Error(data.responseMessage || "Transfer failed");
	}

	return data;
}

// Export the appropriate function based on environment
export const nameEnquiryWithMock = nameEnquiry;
