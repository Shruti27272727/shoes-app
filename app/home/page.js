"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "../components/LogoutButton";

const Home = () => {
  const router = useRouter();
  const [shoes, setShoes] = useState([]);
  const [searchItem, setSearchItem] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [quantities, setQuantities] = useState({});
  const [sortBy, setSortBy] = useState("");
  const [wishlist, setWishlist] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const toggleWishlist = (shoe) => {
    setWishlist((prev) => {
      const exists = prev.find(item => item.id === shoe.id);
      if (exists) {
        return prev.filter(item => item.id !== shoe.id);
      } else {
        return [...prev, shoe];
      }
    });
  };

  const updateQuantity = (id, value) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const newCount = current + value;
      if (newCount < 0) return { ...prev, [id]: 0 };
      return { ...prev, [id]: newCount };
    });
  };

  const fetchShoes = async (search = "", page = 1, sort = sortBy) => {
    try {
      const res = await fetch(`/api/shoes?search=${search}&page=${page}`);
      const data = await res.json();

      let sortedShoes = [...data.data];

      if (sort === "low-high") {
        sortedShoes.sort((a, b) => a.price - b.price);
      } else if (sort === "high-low") {
        sortedShoes.sort((a, b) => b.price - a.price);
      }

      setShoes(sortedShoes);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching shoes:", error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchShoes(searchItem, currentPage, sortBy);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchItem, currentPage, sortBy]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  };

  const handleBuy = (shoe) => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      alert("Please log in to continue.");
      router.push("/Login");
      return;
    }

    const count = quantities[shoe.id];

    router.push(
      `/Cart?id=${shoe.id}&name=${shoe.name}&price=${shoe.price}&userId=${user.id}&count=${count}`
    );
  };

  const handleGoToCart = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id) {
      alert("Please log in to view your cart.");
      router.push("/Login");
      return;
    }
    router.push(`/Cart?userId=${user.id}`);
  };

  return (
    <div>
      <LogoutButton />
      <h1
        style={{
          textAlign: "center",
          padding: "40px",
          fontFamily: "bold",
          fontSize: "40px",
        }}
      >
        Welcome to Shoes.com
      </h1>
      <p style={{ color: "orange", marginTop: "10px", textAlign: "center", padding: "20px" }}>
        Apply coupon SAVE100 to get 100/- off
      </p>

      <div style={{ textAlign: "center", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search by name, brand, or color"
          value={searchItem}
          onChange={(e) => {
            setCurrentPage(1);
            setSearchItem(e.target.value);
          }}
          style={{
            padding: "10px",
            width: "300px",
            borderRadius: "10px",
            border: "solid",
            fontSize: "16px",
          }}
        />
      </div>

      <div style={{ textAlign: "center", marginBottom: "15px" }}>
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
          }}
          style={{
            padding: "10px",
            borderRadius: "10px",
            fontSize: "16px",
            color: "white",
            width: "200px",
          }}
        >
          <option value="" style={{ color: "black" }}>
            Sort by Price
          </option>
          <option value="low-high" style={{ color: "black" }}>
            Price: Low → High
          </option>
          <option value="high-low" style={{ color: "black" }}>
            Price: High → Low
          </option>
        </select>
      </div>

      <div className="shoe-grid">
        {shoes.length > 0 ? (
          shoes.map((shoe) => (
            <div key={shoe.id} className="shoe-card">
              <img
                src={shoe.img}
                alt={shoe.name}
                className="shoe-image"
                style={{ width: "200px", height: "200px" }}
              />
              <ul>
                <li>
                  <b>Name:</b> {shoe.name}
                </li>
                <li>
                  <b>Brand:</b> {shoe.brand}
                </li>
                <li>
                  <b>Color:</b> {shoe.color}
                </li>
                <li>
                  <b>Size:</b> {shoe.size}
                </li>
                <li>
                  <b>Price:</b> ₹{shoe.price}
                </li>
              </ul>

              <div
                className="counter"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <button onClick={() => updateQuantity(shoe.id, -1)}>-</button>
                {quantities[shoe.id] || 0}
                <button onClick={() => updateQuantity(shoe.id, 1)}>+</button>
              </div>

              <button
                onClick={() => toggleWishlist(shoe)}
                style={{
                  backgroundColor: wishlist.find(item => item.id === shoe.id) ? "green" : "gray",
                  color: "white",
                  padding: "7px",
                  margin: "9px 2px",
                  width: "200px",
                  borderRadius: "7px",
                  cursor: "pointer",
                }}
              >
                {wishlist.find(item => item.id === shoe.id) ? "In Wishlist" : "Add to Wishlist"}
              </button>

              <button
                onClick={() => handleBuy(shoe)}
                style={{
                  backgroundColor: "blue",
                  color: "white",
                  padding: "7px",
                  width: "200px",
                  borderRadius: "7px",
                  cursor: "pointer",
                }}
              >
                Buy
              </button>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", fontSize: "18px" }}>
            No results found.
          </p>
        )}
      </div>

      <button
        onClick={handleGoToCart}
        style={{
          backgroundColor: "green",
          color: "white",
          padding: "7px",
          width: "200px",
          borderRadius: "7px",
          cursor: "pointer",
          marginLeft: "560px",
        }}
      >
        Go to Cart
      </button>
      <button
        onClick={() => router.push(`/Wishlist?userId=${user.id}`)}
        style={{
          backgroundColor: "orange",
          color: "white",
          padding: "7px",
          width: "200px",
          borderRadius: "7px",
          cursor: "pointer",
          marginLeft: "20px",
        }}
      >
        Go to Wishlist
      </button>



      <div style={{ textAlign: "center" }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ margin: "10px" }}
        >
          Prev
        </button>
        <span> Page {currentPage} of {totalPages} </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ margin: "10px" }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Home;
