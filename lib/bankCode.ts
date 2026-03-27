// lib/bankCodes.ts
export const BANK_CODE_MAP: Record<string, string> = {
	// Tier 1 Banks
	"Access Bank": "044",
	"Access Bank (Diamond)": "063",
	"Fidelity Bank": "070",
	"First Bank of Nigeria": "011",
	"First City Monument Bank (FCMB)": "214",
	"Guaranty Trust Bank (GTBank)": "058",
	"Zenith Bank": "057",
	"United Bank for Africa (UBA)": "033",
	"Union Bank of Nigeria": "032",
	"Stanbic IBTC Bank": "221",
	"Polaris Bank": "076",

	// Other Commercial Banks
	"Citibank Nigeria": "023",
	"Ecobank Nigeria": "050",
	"Heritage Bank": "030",
	"Keystone Bank": "082",
	"Providus Bank": "101",
	"Sterling Bank": "232",
	"Suntrust Bank": "100",
	"Titan Trust Bank": "102",
	"Unity Bank": "215",
	"Wema Bank": "035",
	"Globus Bank": "103",

	// Microfinance Banks
	"Accion Microfinance Bank": "602",
	"Addosser Microfinance Bank": "604",
	"Agosasa Microfinance Bank": "606",
	"All Workers Microfinance Bank": "608",
	"Alvana Microfinance Bank": "610",
	"Amju Unique Microfinance Bank": "612",
	"Arise Microfinance Bank": "614",
	"ASO Savings & Loans": "401",
	"Balogun Gambari Microfinance Bank": "616",
	"Bancorp Microfinance Bank": "618",
	"Boctrust Microfinance Bank": "620",
	"Branch International": "622",
	"CBA Microfinance Bank": "624",
	"Chikum Microfinance Bank": "626",
	"Consumer Microfinance Bank": "628",
	"Corestep Microfinance Bank": "630",
	"Covenant Microfinance Bank": "632",
	"Crown Microfinance Bank": "634",
	"E-Barcs Microfinance Bank": "636",
	"Easycredit Microfinance Bank": "638",
	"Eco Microfinance Bank": "640",
	"Ekondo Microfinance Bank": "642",
	"Empire Trust Microfinance Bank": "644",
	"Esan Microfinance Bank": "646",
	"Eso-E Microfinance Bank": "648",
	"Express Microfinance Bank": "650",
	"Fairmicro Microfinance Bank": "652",
	"FBN Microfinance Bank": "654",
	"FCT Microfinance Bank": "656",
	"First Heritage Microfinance Bank": "658",
	"First Royal Microfinance Bank": "660",
	"Firsttrust Microfinance Bank": "662",
	"Fortis Microfinance Bank": "664",
	"Girei Microfinance Bank": "666",
	"Gombe Microfinance Bank": "668",
	"GreenBank Microfinance Bank": "670",
	"Haggai Microfinance Bank": "672",
	"Hasal Microfinance Bank": "674",
	"Hope Microfinance Bank": "676",
	"Ibori Microfinance Bank": "678",
	"Iconic Microfinance Bank": "680",
	"Infinity Microfinance Bank": "682",
	"KCMB Microfinance Bank": "684",
	"Lapo Microfinance Bank": "686",
	"Mainstreet Microfinance Bank": "688",
	"Mayfair Microfinance Bank": "690",
	"Microcred Microfinance Bank": "692",
	"Mint Microfinance Bank": "694",
	"Mutual Benefits Microfinance Bank": "696",
	"New Prudential Microfinance Bank": "698",
	"Nnewan Microfinance Bank": "700",
	"NPF Microfinance Bank": "702",
	"Ocheph Microfinance Bank": "704",
	"Omoluabi Microfinance Bank": "706",
	"Opay Microfinance Bank": "708",
	"Paga Microfinance Bank": "710",
	"Pagatech Microfinance Bank": "712",
	"Palmcredit Microfinance Bank": "714",
	"PecanTrust Microfinance Bank": "716",
	"Pennywise Microfinance Bank": "718",
	"Personal Trust Microfinance Bank": "720",
	"Platinum Microfinance Bank": "722",
	"Queen D-Young Microfinance Bank": "724",
	"Regent Microfinance Bank": "726",
	"Renmoney Microfinance Bank": "728",
	"Rephidim Microfinance Bank": "730",
	"Safe Haven Microfinance Bank": "732",
	"Sagamu Microfinance Bank": "734",
	"Seed Capital Microfinance Bank": "736",
	"Shalom Microfinance Bank": "738",
	"Sparkle Microfinance Bank": "740",
	"Standard Microfinance Bank": "742",
	"TCF Microfinance Bank": "744",
	"Trident Microfinance Bank": "746",
	"Trust Microfinance Bank": "748",
	"Unical Microfinance Bank": "750",
	"VFD Microfinance Bank": "752",
	"VFD Microfinance Bank (Vbank)": "754",
	"Visionary Microfinance Bank": "756",
	"Woven Microfinance Bank": "758",
	"Yes Microfinance Bank": "760",
	"Zedvance Microfinance Bank": "762",
	"Zenith Bank (Microfinance)": "764",

	// Mobile Money Operators
	"9PSB": "120001",
	"Agent Banking Company": "120002",
	"AMO Bank": "120003",
	Appzone: "120004",
	Baxi: "120005",
	Cellulant: "120006",
	Crowdyvest: "120007",
	eTranzact: "120008",
	Flutterwave: "120009",
	Interswitch: "120010",
	"Kuda Bank": "090267", // Kuda's NIBSS code
	Mintyn: "120011",
	Mkudi: "120012",
	Moniepoint: "120013",
	"Moniepoint Microfinance Bank": "120014",
	OPay: "120015",
	Paga: "120016",
	Palmpay: "120017",
	PayAttitude: "120018",
	Paystack: "120019",
	PocketApp: "120020",
	Quickteller: "120021",
	Riby: "120022",
	"Smartcash PSB": "120023",
	TeamApt: "120024",
	"Teasy Mobile": "120025",
	"VBank (VFD)": "120026",

	// Merchant Banks
	"Coronation Merchant Bank": "559",
	"FBNQuest Merchant Bank": "560",
	"FSDH Merchant Bank": "561",
	"Rand Merchant Bank": "562",

	// Development Finance Institutions
	"Bank of Agriculture": "090001",
	"Bank of Industry": "090002",
	"Development Bank of Nigeria": "090003",
	"Nigerian Export Import Bank": "090004",
	"Nigerian Infrastructural Bank": "090005",

	// Non-Interest Banks
	"Jaiz Bank": "301",
	"Lotus Bank": "302",
	"Taj Bank": "303",
	"Alternate Bank": "304",

	// Payment Service Banks
	"Hope PSB": "120027",
	"Moneymaster PSB": "120028",
};

// Helper function to get bank code with case-insensitive matching
export function getBankCode(bankName: string): string {
	// Try exact match first
	if (BANK_CODE_MAP[bankName]) {
		return BANK_CODE_MAP[bankName];
	}

	// Try case-insensitive match
	const lowerCaseName = bankName.toLowerCase();
	for (const [key, code] of Object.entries(BANK_CODE_MAP)) {
		if (key.toLowerCase() === lowerCaseName) {
			return code;
		}
	}

	// Try partial match for common variations
	if (lowerCaseName.includes("gtb") || lowerCaseName.includes("guaranty")) {
		return "058";
	}
	if (lowerCaseName.includes("zenith")) {
		return "057";
	}
	if (lowerCaseName.includes("uba")) {
		return "033";
	}
	if (lowerCaseName.includes("access")) {
		return "044";
	}
	if (lowerCaseName.includes("first") && lowerCaseName.includes("bank")) {
		return "011";
	}
	if (lowerCaseName.includes("fidelity")) {
		return "070";
	}
	if (lowerCaseName.includes("fcmb")) {
		return "214";
	}
	if (lowerCaseName.includes("union")) {
		return "032";
	}
	if (lowerCaseName.includes("stanbic")) {
		return "221";
	}
	if (lowerCaseName.includes("polaris")) {
		return "076";
	}
	if (lowerCaseName.includes("kuda")) {
		return "090267";
	}
	if (lowerCaseName.includes("opal") || lowerCaseName.includes("opay")) {
		return "120015";
	}
	if (lowerCaseName.includes("moniepoint")) {
		return "120014";
	}
	if (lowerCaseName.includes("palmpay")) {
		return "120017";
	}

	// Default to GTBank if no match found
	console.warn(
		`Bank code not found for: ${bankName}, defaulting to GTBank (058)`,
	);
	return "058";
}

// Get all bank names for dropdown selection
export function getAllBankNames(): string[] {
	return Object.keys(BANK_CODE_MAP).sort();
}

// Get banks by category
export function getBanksByCategory(): {
	tier1: string[];
	commercial: string[];
	microfinance: string[];
	mobileMoney: string[];
	merchant: string[];
	development: string[];
	nonInterest: string[];
	paymentService: string[];
} {
	const banks = {
		tier1: [
			"Access Bank",
			"Fidelity Bank",
			"First Bank of Nigeria",
			"Guaranty Trust Bank (GTBank)",
			"Zenith Bank",
			"United Bank for Africa (UBA)",
			"Union Bank of Nigeria",
			"Stanbic IBTC Bank",
			"Polaris Bank",
		],
		commercial: [
			"Citibank Nigeria",
			"Ecobank Nigeria",
			"Heritage Bank",
			"Keystone Bank",
			"Providus Bank",
			"Sterling Bank",
			"Suntrust Bank",
			"Titan Trust Bank",
			"Unity Bank",
			"Wema Bank",
			"Globus Bank",
		],
		microfinance: [] as string[],
		mobileMoney: [] as string[],
		merchant: [
			"Coronation Merchant Bank",
			"FBNQuest Merchant Bank",
			"FSDH Merchant Bank",
			"Rand Merchant Bank",
		],
		development: [
			"Bank of Agriculture",
			"Bank of Industry",
			"Development Bank of Nigeria",
			"Nigerian Export Import Bank",
			"Nigerian Infrastructural Bank",
		],
		nonInterest: ["Jaiz Bank", "Lotus Bank", "Taj Bank", "Alternate Bank"],
		paymentService: ["Hope PSB", "Moneymaster PSB"],
	};

	// Categorize microfinance banks
	for (const bank of Object.keys(BANK_CODE_MAP)) {
		if (bank.includes("Microfinance") && !banks.microfinance.includes(bank)) {
			banks.microfinance.push(bank);
		}
		if (bank.includes("PSB") || bank === "9PSB" || bank === "Smartcash PSB") {
			banks.paymentService.push(bank);
		}
		if (
			[
				"OPay",
				"Paga",
				"Palmpay",
				"Moniepoint",
				"Kuda Bank",
				"VBank (VFD)",
				"Baxi",
				"Flutterwave",
				"Paystack",
				"Quickteller",
			].includes(bank)
		) {
			banks.mobileMoney.push(bank);
		}
	}

	banks.microfinance.sort();
	banks.mobileMoney.sort();
	banks.paymentService.sort();

	return banks;
}
