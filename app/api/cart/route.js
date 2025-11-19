import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";


export async function PUT(req) {
  try {
    const { user_id, id, name, price, quantity } = await req.json();

    if (!user_id || !id) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }


    const existing = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 AND item_id = $2",
      [user_id, id]
    );

    if (existing.rows.length > 0) {
      const oldQty = existing.rows[0].quantity;
      const newQty = oldQty + quantity;
      await pool.query(
        "UPDATE cart SET quantity = $1 WHERE user_id = $2 AND item_id = $3",
        [newQty, user_id, id]
      );

    } else {

      await pool.query(
        "INSERT INTO cart (user_id, item_id, name, price, quantity) VALUES ($1, $2, $3, $4, $5)",
        [user_id, id, name, price, quantity]
      );
    }

    const result = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 ORDER BY id DESC",
      [user_id]
    );

    return NextResponse.json({
      message: "Item added or updated",
      updatedCart: result.rows,
    });
  } catch (error) {
    console.error("Add/Update error:", error);
    return NextResponse.json(
      { message: "Failed to add/update item" },
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
    console.error("Fetch error:", error);
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
        { message: "Missing id or user_id" },
        { status: 400 }
      );
    }

    await pool.query("DELETE FROM cart WHERE item_id = $1 AND user_id = $2", [
      id,
      user_id,
    ]);

    const result = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 ORDER BY id DESC",
      [user_id]
    );

    return NextResponse.json({
      message: "Item deleted",
      updatedCart: result.rows,
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { message: "Failed to delete item" },
      { status: 500 }
    );
  }
}


export async function 
POST(req) {
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
      message: "Payment success. Cart cleared.",
      total_amount,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { message: "Payment failed" },
      { status: 500 }
    );
  }
}
