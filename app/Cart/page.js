"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "../components/LogoutButton";

export default function Cart() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const name = searchParams.get("name");
  const price = searchParams.get("price");
  const id = searchParams.get("id");
  const count = parseInt(searchParams.get("count")) || 1;

  const [cartItems, setCartItems] = useState([]);
  const [isPaid, setIsPaid] = useState(false);
  const [user, setUser] = useState(null);


  useEffect(() => {
    const checkUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser) {
        alert("Please login first");
        router.push("/login");
        return;
      }
      setUser(storedUser);
    };
    checkUser();
  }, [router]);


  useEffect(() => {
    if (!user) return;

    const fetchCart = async () => {
      const res = await fetch(`/api/cart?user_id=${user.id}`);
      const data = await res.json();
      setCartItems(data);
    };

    fetchCart();
  }, [user]);


  useEffect(() => {
    const addItem = async () => {
      if (!user || !id) return;

      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          id,
          name,
          price,
          quantity: count,
        }),
      });

      const res = await fetch(`/api/cart?user_id=${user.id}`);
      const data = await res.json();
      setCartItems(data);
    };

    addItem();
  }, [name, price, user, count, id]);


  const handleDelete = async (itemId) => {
    await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: itemId, user_id: user.id }),
    });


    setCartItems(cartItems.filter((item) => item.item_id !== itemId));
  };


  const handlePayment = async () => {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user.id }),
    });

    alert("Payment done successfully!");
    setCartItems([]);
    setIsPaid(true);
  };

  const handleCart = () => {
    router.push("/home");
  };

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * (item.quantity || 1), 0
  );

  return (
    <div style={{ textAlign: "center" }}>
      <LogoutButton />

      {isPaid ? (
        <>
          <h1>Thank You</h1>
          <button
            onClick={handleCart}
            style={{
              backgroundColor: "blue",
              color: "white",
              padding: "10px 20px",
              borderRadius: "8px",
            }}
          >
            Go Back to Home
          </button>
        </>
      ) : (
        <>
          <h1>Your Cart</h1>

          {cartItems.length === 0 ? (
            <p>No items yet!</p>
          ) : (
            <div>
              {cartItems.map((item) => (
                <div
                  key={item.item_id}
                  style={{
                    margin: "auto",
                    width: "280px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <p>
                    <strong>Shoe:</strong> {item.name}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {item.quantity}
                  </p>
                  <p>
                    <strong>Price:</strong> ₹{item.price}
                  </p>

                  <button
                    onClick={() => handleDelete(item.item_id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      height: "40px",
                      width: "100px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}

              <h3>Total: ₹{total}</h3>

              <button
                onClick={handlePayment}
                style={{
                  backgroundColor: "green",
                  color: "white",
                  padding: "10px",
                  borderRadius: "6px",
                  width: "120px",
                  cursor: "pointer",
                }}
              >
                Pay Now
              </button>
            </div>
          )}

          <button
            onClick={handleCart}
            style={{
              backgroundColor: "blue",
              color: "white",
              padding: "10px",
              borderRadius: "6px",
              width: "120px",
              cursor: "pointer",
              margin: "10px",
            }}
          >
            BUY AGAIN
          </button>
        </>
      )}
    </div>
  );
}
