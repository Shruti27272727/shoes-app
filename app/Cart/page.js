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
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponUsage, setCouponUsage] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser?.id) return 0;
    return Number(localStorage.getItem(`coupon_${storedUser.id}`)) || 0;
  });

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
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.id,
        total_amount: finalTotal
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert(`Payment done! Total: ${data.total_amount}`);
      setCartItems([]);
      setIsPaid(true);
    } else {
      alert("Payment failed: " + data.message);
    }
  };


  const handleCart = () => {
    router.push("/home");
  };

  const totalQuantity = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * (item.quantity || 1),
    0
  );
  const applyCoupon = () => {
    if (couponCode !== "SAVE100") {
      alert("Invalid coupon code");
      return;
    }

    if (couponUsage >= 2) {
      alert("The coupon has expired");
      return;
    }

    setCouponDiscount(100);
    const newUsage = couponUsage + 1;
    setCouponUsage(newUsage);

    localStorage.setItem(`coupon_${user.id}`, newUsage);

    alert("Rs.100 discount applied");
  };

  const discount = totalQuantity > 2 ? total * 0.15 : 0;
  const finalTotal = total - discount - couponDiscount;


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
                    <strong>Price:</strong> {item.price}
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
              ))}<div>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                  style={{ padding: "8px", width: "150px", marginTop: "20px", }}
                />
                <button
                  onClick={applyCoupon}
                  style={{
                    marginLeft: "10px",
                    padding: "8px 14px",
                    backgroundColor: "orange",
                    color: "white",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Apply
                </button>

                {couponDiscount > 0 && (
                  <h3 style={{ color: "green" }}>Coupon Discount: {couponDiscount}</h3>
                )}
              </div>

              <h3>Total Items: {totalQuantity}</h3>

              {discount > 0 && (
                <h3 style={{ color: "green" }}>
                  Discount (15%) = {discount.toFixed(2)}
                </h3>
              )}

              <h2>Final Total: {finalTotal.toFixed(2)}</h2>


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
