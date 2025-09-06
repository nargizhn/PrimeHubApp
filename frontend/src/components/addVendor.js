import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/prime-logo.png';

export default function AddVendor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", category: "", city: "", representative: "", contact: "", price: "", notes: "", agreementNumber: "", bankAccount: "", images: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newVendor = { ...formData, images: formData.images ? [formData.images.name] : [] };
    const token = localStorage.getItem("token"); // burada token alınıyor
    if (!token) { alert("User not authenticated!"); return; }

    try {
      const response = await fetch("http://localhost:9090/api/vendors", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // token header olarak gönderiliyor
        },
        body: JSON.stringify(newVendor),
      });

      if (response.ok) { alert("Vendor added successfully!"); navigate("/vendor-list"); }
      else if (response.status === 401) { alert("Unauthorized! Please login again."); }
      else { const errMessage = await response.text(); alert("Failed to add vendor: " + errMessage); }
    } catch (err) {
      console.error("Error:", err);
      alert("Network error or server not reachable.");
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: "Segoe UI, sans-serif", minHeight: "100vh", backgroundColor: "#f9f9f9", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} alt="Logo" style={{ height: 40 }} />
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>➕ Add <span style={{ color: "#d90000" }}>Vendor</span></h1>
        </div>
        <button onClick={() => navigate("/vendor-list")} style={{ background: "none", border: "none", color: "#d90000", fontSize: 16, cursor: "pointer" }}>← Back to Vendor List</button>
      </div>

      <div style={{ backgroundColor: "#fff", padding: 30, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", flexGrow: 1 }}>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 50, rowGap: 20 }}>
          {["name", "category", "city", "representative", "contact", "price", "agreementNumber", "bankAccount"].map((field) => (
            <div key={field} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontWeight: 600 }}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input type={field === "price" ? "number" : "text"} name={field} onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", width: "100%" }} required={field==="name"} />
            </div>
          ))}

          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>Notes</label>
            <textarea name="notes" onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", minHeight: 80, width: "100%" }} />
          </div>

          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <label style={{ fontWeight: 600 }}>Upload Images</label>
            <input type="file" name="images" onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
          </div>

          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button type="submit" style={{ padding: "10px 20px", borderRadius: 6, border: "none", backgroundColor: "#d90000", color: "#fff", cursor: "pointer" }}>Save Vendor</button>
          </div>
        </form>
      </div>
    </div>
  );
}
