import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";

export async function POST(req) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    
    const totalResult = await pool.query(
      "SELECT SUM(price * quantity) AS total FROM cart WHERE user_id = $1",
      [user_id]
    );

    const total_amount = totalResult.rows[0].total || 0;

    
    await pool.query(
      "INSERT INTO payments (user_id, total_amount, paid_at) VALUES ($1, $2, NOW())",
      [user_id, total_amount]
    );

   
    await pool.query("DELETE FROM cart WHERE user_id = $1", [user_id]);

    
    return NextResponse.json({
      message: "Payment successful",
      total_amount,
      
    });
  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json(
      { message: "Payment failed" },
      { status: 500 }
    );
  }
}
