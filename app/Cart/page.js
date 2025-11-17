"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "../components/LogoutButton";

export default function Cart() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get("name");
  const price = searchParams.get("price");

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
      try {
        const res = await fetch(`/api/cart?user_id=${user.id}`);
        const data = await res.json();
        setCartItems(data);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, [user]);

 
  useEffect(() => {
    const addItem = async () => {
      if (!user || !name || !price) return;

      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            name,
            price,
          }),
        });

        
        const res = await fetch(`/api/cart?user_id=${user.id}`);
        const data = await res.json();
        setCartItems(data);
      } catch (error) {
        console.error("Error adding to cart:", error);
      }
    };

    addItem();
  }, [name, price, user]);


  const handleDelete = async (itemId) => {
    try {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, user_id: user.id }),
      });

      const updated = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updated);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

 
  const handlePayment = async () => {
    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });

      alert("Payment done successfully!");
      setCartItems([]);
      setIsPaid(true);
    } catch (error) {
      console.error("Error clearing cart after payment:", error);
    }
  };

  const handleCart = () => {
    router.push("/home");
  };

  const total = cartItems.reduce((sum, item) => sum + Number(item.price), 0);

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
              cursor: "pointer",
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
                  key={item.id}
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
                    <strong>Price:</strong> ₹{item.price}
                  </p>

                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      height: "40px",
                      width: "100px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      border: "none",
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
                  border: "none",
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
              border: "none",
            }}
          >
            BUY AGAIN
          </button>
        </>
      )}
    </div>
  );
}
