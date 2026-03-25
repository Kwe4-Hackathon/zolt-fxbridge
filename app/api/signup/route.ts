// app/api/signup/route.ts
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const { name, email, password } = await req.json();

		console.log("=== SIGNUP ATTEMPT ===");
		console.log("Email:", email);
		console.log("Name:", name);

		await connectDB();

		// Debug: Check current database
		const db = User.db;
		console.log("Connected to database:", db?.name);

		// Debug: List all users (be careful in production)
		const allUsers = await User.find({}).select("email");
		console.log("Total users in DB:", allUsers.length);
		console.log(
			"Existing emails:",
			allUsers.map((u) => u.email),
		);

		// Check if user exists (case-insensitive)
		const exists = await User.findOne({
			email: { $regex: new RegExp(`^${email}$`, "i") },
		});

		console.log("User exists check result:", exists);

		if (exists) {
			console.log("User found with email:", exists.email);
			return NextResponse.json(
				{ error: "User already exists" },
				{ status: 400 },
			);
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const user = await User.create({
			name: name.trim(),
			email: email.toLowerCase().trim(),
			password: hashedPassword,
			ngnBalance: 250000,
			usdBalance: 0,
		});

		console.log("User created successfully:", user._id);

		return NextResponse.json(
			{
				message: "User registered successfully",
				userId: user._id,
			},
			{ status: 201 },
		);
	} catch (error: any) {
		console.error("Signup error details:", error);

		return NextResponse.json(
			{ error: error.message || "Failed to create account" },
			{ status: 500 },
		);
	}
}
