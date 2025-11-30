import { NextResponse } from "next/server";
import pool from "../../../lib/db";
export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ message: "userId is required" });
    }
    const result = await pool.query(
      "SELECT usage FROM coupons WHERE user_id = $1",
      [userId]
    );
    const usage = result.rows.length > 0 ? result.rows[0].usage : 0;
    return NextResponse.json({ usage });
  } catch (error) {
    console.error("Error fetching coupon usage:", error);
    return NextResponse.json({ message: "Failed to fetch coupon usage" });
  }
}
export async function POST(req) {
  try {
    const { userId, newUsage } = await req.json();
    if (!userId || newUsage === undefined) {
      return NextResponse.json({ message: "Missing data" });
    }
    await pool.query(
      `INSERT INTO coupons (user_id, usage) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET usage = $2`,
      [userId, newUsage]
    );
    return NextResponse.json({ success: true, usage: newUsage });
  } catch (error) {
    console.error("Error updating coupon usage:", error);
    return NextResponse.json({ message: "Failed to update coupon usage" });
  }
}
