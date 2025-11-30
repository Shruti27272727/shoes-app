import { NextResponse } from "next/server";
import pool from "../../../lib/db.js";

export async function PUT(req) {
  try {
    const { user_id, id, name, price, quantity } = await req.json();

    if (!user_id || !id || !quantity) {
      return NextResponse.json(
        { message: "Missing required fields" }
      );
    }
    const existing = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 AND item_id = $2",
      [user_id, id]
    );
    if (existing.rows.length > 0) {
      const newQty = existing.rows[0].quantity + quantity;
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
      { message: "Failed to add/update item" }
    );
  }
}
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");
    if (!user_id) {
      return NextResponse.json(
        { message: "User ID is required" }
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
      { message: "Failed to fetch cart" }
    );
  }
}
export async function DELETE(req) {
  try {
    const { id, user_id } = await req.json();

    if (!id || !user_id) {
      return NextResponse.json(
        { message: "Missing id or user_id" }
      );
    }
    await pool.query(
      "DELETE FROM cart WHERE item_id = $1 AND user_id = $2",
      [id, user_id]
    );
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
      { message: "Failed to delete item" }
    );
  }
}
