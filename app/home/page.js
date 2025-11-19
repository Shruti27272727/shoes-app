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



  const updateQuantity = (id, value) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      const newCount = current + value;
      if (newCount < 0) return { ...prev, [id]: 0 };
      return { ...prev, [id]: newCount };
    });
  };



  const fetchShoes = async (search = "", page = 1) => {
    try {
      const res = await fetch(`/api/shoes?search=${search}&page=${page}`);
      const data = await res.json();
      setShoes(data.data);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching shoes:", error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchShoes(searchItem, currentPage);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchItem, currentPage]);

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
                <li><b>Name:</b> {shoe.name}</li>
                <li><b>Brand:</b> {shoe.brand}</li>
                <li><b>Color:</b> {shoe.color}</li>
                <li><b>Size:</b> {shoe.size}</li>
                <li><b>Price:</b> ₹{shoe.price}</li>
              </ul>


              <div className="counter"
                style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button onClick={() => updateQuantity(shoe.id, -1)}>-</button>
                <p>{quantities[shoe.id] || 0}</p>
                <button onClick={() => updateQuantity(shoe.id, 1)}>+</button>
              </div>

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
          <p style={{ textAlign: "center", fontSize: "18px" }}>No results found.</p>
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
          marginLeft: "660px",
        }}
      >
        Go to Cart
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
