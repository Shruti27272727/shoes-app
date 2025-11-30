"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Wishlist() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const loadWishlist = async () => {
      const res = await fetch(`/api/wishlist?userId=${userId}`);
      const data = await res.json();
      setWishlist(data);
    };
    loadWishlist();
  }, [userId]);

  const removeItem = async (shoeId) => {
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, shoeId }),
    });

    setWishlist((prev) => prev.filter((item) => item.shoe_id !== shoeId));
  };

  return (
    <div>
      <h1 style={{ textAlign: "center", padding: "20px" }}>Your Wishlist</h1>

      <div>
        <button
          onClick={() => router.push("/home")}
          style={{
            backgroundColor: "green",
            color: "white",
            padding: "10px 20px",
            borderRadius: "7px",
            cursor: "pointer",
            marginLeft: "700px",
          }}
        >
          Go to Home
        </button>
      </div>

      {wishlist.length === 0 ? (
        <p style={{ textAlign: "center" }}>No items in wishlist.</p>
      ) : (
        <div className="shoe-grid">
          {wishlist.map((shoe) => (
            <div key={shoe.shoe_id} className="shoe-card">
              <img
                src={shoe.img}
                alt={shoe.name}
                style={{ width: "200px", height: "200px" }}
              />

              <ul>
                <li><b>Name:</b> {shoe.name}</li>
                <li><b>Brand:</b> {shoe.brand}</li>
                <li><b>Color:</b> {shoe.color}</li>
                <li><b>Size:</b> {shoe.size}</li>
                <li><b>Price:</b> ₹{shoe.price}</li>
              </ul>

              <button
                onClick={() => removeItem(shoe.shoe_id)}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  padding: "7px",
                  width: "200px",
                  borderRadius: "7px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
