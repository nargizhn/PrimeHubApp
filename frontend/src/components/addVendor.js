import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/prime-logo.png';

export default function AddVendor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    city: "",
    representative: "",
    contact: "",
    price: "",
    notes: "",
    agreementNumber: "",
    bankAccount: "",
    images: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Vendor Data:", formData);
    // Firestore kaydetme logic buraya gelecek
    navigate("/vendor-list");
  };

  return (
    <div style={{
      padding: 30,
      fontFamily: "Segoe UI, sans-serif",
      minHeight: "100vh",
      backgroundColor: "#f9f9f9",
      display: "flex",
      flexDirection: "column"
    }}>
      
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} alt="Logo" style={{ height: 40 }} />
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
            ➕ Add <span style={{ color: "#d90000" }}>Vendor</span>
          </h1>
        </div>
        <button
          onClick={() => navigate("/vendor-list")}
          style={{
            background: "none",
            border: "none",
            color: "#d90000",
            fontSize: 16,
            cursor: "pointer"
          }}
        >
          ← Back to Vendor List
        </button>
      </div>

      {/* Form Container */}
      <div style={{
        backgroundColor: "#fff",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        flexGrow: 1
      }}>
        <form onSubmit={handleSubmit} style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          columnGap: 50,
          rowGap: 20
        }}>
          {[
            { label: "Vendor Name", name: "name", type: "text" },
            { label: "Category", name: "category", type: "text" },
            { label: "City", name: "city", type: "text" },
            { label: "Representative", name: "representative", type: "text" },
            { label: "Contact", name: "contact", type: "text" },
            { label: "Price", name: "price", type: "number" },
            { label: "Agreement Number", name: "agreementNumber", type: "text" },
            { label: "Bank Account", name: "bankAccount", type: "text" },
          ].map((field, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontWeight: 600 }}>{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                onChange={handleChange}
                style={{
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  display: "block",
                  width: "100%"
                }}
                required={field.name === "name"}
              />
            </div>
          ))}

          {/* Notes */}
          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>Notes</label>
            <textarea
              name="notes"
              onChange={handleChange}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", minHeight: 80, width: "100%" }}
            />
          </div>

          {/* Images */}
          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <label style={{ fontWeight: 600 }}>Upload Images</label>
            <input
              type="file"
              name="images"
              onChange={handleChange}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button type="submit" style={{
              padding: "10px 20px",
              borderRadius: 6,
              border: "none",
              backgroundColor: "#d90000",
              color: "#fff",
              cursor: "pointer"
            }}>
              Save Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
