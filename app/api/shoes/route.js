import { NextResponse } from "next/server";
import pool from "../../../lib/db";
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const sort = searchParams.get("sort") || ""; 
    const limit = 10;
    const offset = (page - 1) * limit;
    let orderBy = "id";
    if (sort === "low-high") orderBy = "price ASC";
    else if (sort === "high-low") orderBy = "price DESC";
    const query = `
      SELECT * FROM shoes
      WHERE LOWER(name) LIKE LOWER($1)
         OR LOWER(brand) LIKE LOWER($1)
         OR LOWER(color) LIKE LOWER($1)
      ORDER BY ${orderBy}
      LIMIT $2 OFFSET $3
      `;
    const values = [`%${search}%`, limit, offset];
    const result = await pool.query(query, values);

    const countQuery = `
      SELECT COUNT(*) FROM shoes
      WHERE LOWER(name) LIKE LOWER($1)
         OR LOWER(brand) LIKE LOWER($1)
         OR LOWER(color) LIKE LOWER($1)
         `;
    const countResult = await pool.query(countQuery, [`%${search}%`]);
    const totalCount = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: result.rows,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching shoes:", error);
    return NextResponse.json({ error: "Database fetch failed" }, { status: 500 });
  }
}
