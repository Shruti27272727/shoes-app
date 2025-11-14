import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";


export async function POST(req) {
  try {
    const { user_id, name, price } = await req.json();

    if (!user_id || !name || !price) {
      return NextResponse.json(
        { message: "User ID, name, and price are required" },
        { status: 400 }
      );
    }

    
    await pool.query(
      "INSERT INTO cart (user_id, name, price) VALUES ($1, $2, $3)",
      [user_id, name, price]
    );

  
    const result = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 ORDER BY id DESC",
      [user_id]
    );

    return NextResponse.json({
      message: "Item added successfully",
      updatedCart: result.rows,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json(
      { message: "Failed to add item to cart" },
      { status: 500 }
    );
  }
}


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 ORDER BY id DESC",
      [user_id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Fetch cart error:", error);
    return NextResponse.json(
      { message: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { id, user_id } = await req.json();

    if (!id || !user_id) {
      return NextResponse.json(
        { message: "Item ID and User ID are required" },
        { status: 400 }
      );
    }

    
    await pool.query("DELETE FROM cart WHERE id = $1 AND user_id = $2", [
      id,
      user_id,
    ]);

    const result = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 ORDER BY id DESC",
      [user_id]
    );

    return NextResponse.json({
      message: "Item deleted successfully",
      updatedCart: result.rows,
    });
  } catch (error) {
    console.error("Delete item error:", error);
    return NextResponse.json(
      { message: "Failed to delete item" },
      { status: 500 }
    );
  }
}


export async function PUT(req) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    
    const totalResult = await pool.query(
      "SELECT COALESCE(SUM(price), 0) AS total FROM cart WHERE user_id = $1",
      [user_id]
    );
    const total_amount = totalResult.rows[0].total || 0;

    
    await pool.query(
      "INSERT INTO payments (user_id, total_amount, paid_at) VALUES ($1, $2, NOW())",
      [user_id, total_amount]
    );

    
    await pool.query("DELETE FROM cart WHERE user_id = $1", [user_id]);

    return NextResponse.json({
      message: "Payment recorded successfully and cart cleared.",
      total_amount,
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { message: "Failed to record payment or clear cart" },
      { status: 500 }
    );
  }
}
