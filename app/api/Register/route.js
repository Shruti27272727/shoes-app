import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();


    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ message: "Password is required" }, { status: 400 });
    }

   
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);


    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashedPassword]
    );

    return NextResponse.json(
      { message: "User registered successfully", user: result.rows[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Registration failed" }, { status: 500 });
  }
}
