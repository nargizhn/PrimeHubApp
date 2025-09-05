import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore"; 
import { db } from "../firebase"; // DB erişim hazır olduğunda aktif edebilirsin
import logo from "../assets/logo6.png";

// Props: isAdmin (true/false)
export default function EditVendor({ isAdmin }) {
  const { vendorId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    city: "",
    contact: "",
    price: "",
    category: "",
  });

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        // Firestore hazır olunca:
        // const docRef = doc(db, "vendors", vendorId);
        // const docSnap = await getDoc(docRef);
        // if (docSnap.exists()) {
        //   setFormData(docSnap.data());
        // }

        // Şimdilik mock vendor
        setFormData({
          name: "Mock Vendor",
          city: "New York",
          contact: "123-456-7890",
          price: "200",
          category: "Art",
        });
      } catch (error) {
        console.error("Error fetching vendor:", error);
      }
    };

    fetchVendor();
  }, [vendorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Firestore güncelleme:
      // const docRef = doc(db, "vendors", vendorId);
      // await updateDoc(docRef, formData);

      console.log("Vendor updated:", formData);
      navigate("/vendor-list");
    } catch (error) {
      console.error("Error updating vendor:", error);
    }
  };

  return (
    <div
      style={{
        padding: 30,
        fontFamily: "Segoe UI, sans-serif",
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} alt="Logo" style={{ height: 40 }} />
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
            ✏️ Edit <span style={{ color: "#d90000" }}>Vendor</span>
          </h1>
        </div>
        <button
          onClick={() => navigate("/vendor-list")}
          style={{
            background: "none",
            border: "none",
            color: "#d90000",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          ← Back to Vendor List
        </button>
      </div>

      {/* Form Container */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          flexGrow: 1,
        }}
      >
        <form
          onSubmit={handleSave}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: 20,
            rowGap: 20,
          }}
        >
          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>Vendor Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={false} // Hem User hem Admin editleyebilir
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
          </div>

          {/* City */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={false} // Hem User hem Admin editleyebilir
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
          </div>

          {/* Contact Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>Contact Info</label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              disabled={false} // Hem User hem Admin editleyebilir
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
          </div>

          {/* Price */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              disabled={!isAdmin} // Sadece Admin editleyebilir
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                backgroundColor: !isAdmin ? "#f0f0f0" : "#fff",
              }}
            />
          </div>

          {/* Category */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={false} // Hem User hem Admin editleyebilir
              style={{
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
              }}
            />
          </div>

          {/* Save Button */}
          <div
            style={{
              gridColumn: "span 2",
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 10,
            }}
          >
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                borderRadius: 6,
                border: "none",
                backgroundColor: "#d90000",
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
