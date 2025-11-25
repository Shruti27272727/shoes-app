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
  const loadWishlist = () => {
    const data = JSON.parse(localStorage.getItem(`wishlist_${userId}`)) || [];
    setWishlist(data);
  };
  loadWishlist();
}, [userId]);

  const removeItem = (id) => {
    const updated = wishlist.filter((item) => item.id !== id);
    setWishlist(updated);
    localStorage.setItem(`wishlist_${userId}`, JSON.stringify(updated));
  };

  return (
    
    <div>
      <h1 style={{ textAlign: "center", padding: "20px" }}>Your Wishlist</h1>
       <div >
        <button
          onClick={() => router.push("/home")}
          style={{
            backgroundColor: "green",
            color: "white",
            padding: "10px 20px",
            borderRadius: "7px",
            cursor: "pointer",
            textAlign: "center",
            marginBottom: "20px",
            marginLeft:"700px",
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
            <div key={shoe.id} className="shoe-card">
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
                onClick={() => removeItem(shoe.id)}
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
