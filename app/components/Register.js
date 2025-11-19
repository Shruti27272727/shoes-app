"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("/api/Register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Registration successful!");
      router.push("/login");
    } else {
      if (data.message && data.message.toLowerCase().includes("exists")) {
        alert("User already exists. Please login.");
        router.push("/login");
      } else {
        alert(data.message || "Registration failed");
      }
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
      }}
    >
      <div
        style={{
          height: "380px",
          width: "320px",
          borderRadius: "10px",
          backgroundColor: "white",
          border: "3px solid orange",
          color: "black",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "15px",
            width: "100%",
          }}
        >
          <h2>Register</h2>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "80%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid",
              textAlign: "center",
            }}
          />

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "80%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid",
              textAlign: "center",
            }}
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "80%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid",
              textAlign: "center",
            }}
          />

          <button
            type="submit"
            style={{
              backgroundColor: "black",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
              width: "50%",
              cursor: "pointer",
            }}
          >
            Submit
          </button>


          <button
            type="button"
            onClick={() => router.push("/login")}
            style={{
              backgroundColor: "orange",
              color: "black",
              padding: "8px",
              borderRadius: "5px",
              width: "50%",
              cursor: "pointer",
              border: "none",
              fontWeight: "bold",
            }}
          >
            Login
          </button>

        </form>
      </div>
    </div>
  );
}
