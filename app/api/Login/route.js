import { NextResponse } from "next/server";
import pool from "../../../lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Incorrect password" }, { status: 401 });
    }

    return NextResponse.json({
      message: "Login successful",
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
