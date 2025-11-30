import { NextResponse } from "next/server";
import pool from "../../../lib/db";
export async function POST(req) {
  try {
    const { userId, shoe } = await req.json();

    if (!userId || !shoe) {
      return NextResponse.json({ message: "Missing data" });
    }
    const exists = await pool.query(
      "SELECT * FROM wishlist WHERE user_id=$1 AND shoe_id=$2",
      [userId, shoe.id]
    );

    if (exists.rows.length > 0) {
      return NextResponse.json({ message: "Already in wishlist" });
    } 
    await pool.query(
      `INSERT INTO wishlist (user_id, shoe_id, name, brand, color, size, price, img)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        userId,
        shoe.id,
        shoe.name,
        shoe.brand,
        shoe.color,
        shoe.size,
        shoe.price,
        shoe.img
      ]
    );
    return NextResponse.json(
      { message: "Added to wishlist" },
     
    );
  } catch (err) {
    console.error("Wishlist POST error:", err);
    return NextResponse.json({ message: "Server error" });
  }
}
export async function GET(req) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ message: "UserId missing" });
    }
    const result = await pool.query("SELECT * FROM wishlist WHERE user_id=$1", [userId]);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Wishlist GET error:", err);
    return NextResponse.json({ message: "Server error" });
  }
}
export async function DELETE(req) {
  try {
    const { userId, shoeId } = await req.json();

    await pool.query(
      "DELETE FROM wishlist WHERE user_id=$1 AND shoe_id=$2",
      [userId, shoeId]
    );
    return NextResponse.json({ message: "Removed" });
  } catch (err) {
    console.error("Wishlist DELETE error:", err);
    return NextResponse.json({ message: "Server error" });
  }
}
