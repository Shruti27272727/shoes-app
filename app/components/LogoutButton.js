"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("user");  
    alert("Logged out successfully");
    router.push("/"); 
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        position: "absolute",
        backgroundColor: "red",
        width: "70px",
        top: "20px",
        right: "30px",
        padding: "10px",
        cursor: "pointer",
        color: "white",
        borderRadius: "5px",
      }}
    >
      Logout
    </button>
  );
}
