// lib/interswitch.ts
import crypto from "crypto";

// Environment configuration
const IS_SANDBOX =
	process.env.NODE_ENV !== "production" ||
	process.env.INTERSWITCH_ENV === "sandbox";

// Base URLs
const BASE_URL = IS_SANDBOX
	? process.env.NEXT_PUBLIC_INTERSWITCH_BASE_URL ||
		"https://sandbox.interswitchng.com"
	: process.env.NEXT_PUBLIC_INTERSWITCH_BASE_URL ||
		"https://api.interswitchng.com";

const AUTH_URL = IS_SANDBOX
	? process.env.NEXT_PUBLIC_INTERSWITCH_AUTH_URL ||
		"https://sandbox.interswitchng.com/passport"
	: process.env.NEXT_PUBLIC_INTERSWITCH_AUTH_URL ||
		"https://passport.interswitchng.com";

const CLIENT_ID = process.env.NEXT_PUBLIC_INTERSWITCH_CLIENT_ID!;
const SECRET_KEY = process.env.NEXT_PUBLIC_INTERSWITCH_SECRET_KEY!;

export function getInterswitchHeaders(
	method: string,
	url: string,
	additionalHeaders?: Record<string, string>,
) {
	const timestamp = Math.floor(Date.now() / 1000).toString();
	const nonce = crypto.randomBytes(16).toString("hex");

	const signatureString = `${method}&${encodeURIComponent(url)}&${timestamp}&${nonce}&${CLIENT_ID}&${SECRET_KEY}`;
	const signature = crypto
		.createHmac("sha1", SECRET_KEY)
		.update(signatureString)
		.digest("base64");

	return {
		"Content-Type": "application/json",
		"User-Agent": "Zolt/1.0",
		Authorization: `InterswitchAuth ${Buffer.from(CLIENT_ID).toString("base64")}`,
		Timestamp: timestamp,
		Nonce: nonce,
		SignatureMethod: "SHA1",
		Signature: signature,
		...additionalHeaders,
	};
}

export function getAuthHeader(method: string, path: string) {
	return getInterswitchHeaders(method, path);
}

export class InterswitchClient {
	private baseURL: string;
	private authURL: string;
	private timeout: number;

	constructor(timeout: number = 30000) {
		this.baseURL = BASE_URL;
		this.authURL = AUTH_URL;
		this.timeout = timeout;
	}

	private async fetchWithTimeout(
		url: string,
		options: RequestInit,
	): Promise<Response> {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.timeout);

		try {
			const response = await fetch(url, {
				...options,
				signal: controller.signal,
			});
			clearTimeout(timeoutId);
			return response;
		} catch (error) {
			clearTimeout(timeoutId);
			if (error instanceof Error && error.name === "AbortError") {
				throw new Error("Request timeout");
			}
			throw error;
		}
	}

	async getAccessToken(): Promise<string> {
		const response = await fetch(`${this.authURL}/oauth/token`, {
			method: "POST",
			headers: {
				Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${SECRET_KEY}`).toString("base64")}`,
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: "grant_type=client_credentials",
		});

		const data = await response.json();

		if (!response.ok) {
			throw new Error(
				`Failed to get access token: ${data.error_description || data.message}`,
			);
		}

		return data.access_token;
	}

	async post(endpoint: string, body: any, headers?: Record<string, string>) {
		const method = "POST";
		const fullUrl = `${this.baseURL}${endpoint}`;

		// Use provided headers or generate default ones
		const requestHeaders = headers || getInterswitchHeaders(method, endpoint);

		const response = await this.fetchWithTimeout(fullUrl, {
			method,
			headers: requestHeaders,
			body: JSON.stringify(body),
		});

		const data = await response.json();

		if (!response.ok) {
			throw {
				status: response.status,
				statusText: response.statusText,
				data,
				responseCode: data.responseCode,
				responseMessage: data.responseMessage || data.message,
			};
		}

		return data;
	}

	async get(endpoint: string, headers?: Record<string, string>) {
		const method = "GET";
		const fullUrl = `${this.baseURL}${endpoint}`;

		// Use provided headers or generate default ones
		const requestHeaders = headers || getInterswitchHeaders(method, endpoint);

		const response = await this.fetchWithTimeout(fullUrl, {
			method,
			headers: requestHeaders,
		});

		const data = await response.json();

		if (!response.ok) {
			throw {
				status: response.status,
				statusText: response.statusText,
				data,
				responseCode: data.responseCode,
				responseMessage: data.responseMessage || data.message,
			};
		}

		return data;
	}

	async postWithOAuth(endpoint: string, body: any) {
		const token = await this.getAccessToken();
		return this.post(endpoint, body, {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		});
	}

	async getWithOAuth(endpoint: string) {
		const token = await this.getAccessToken();
		return this.get(endpoint, {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		});
	}
}

export const interswitchClient = new InterswitchClient();
