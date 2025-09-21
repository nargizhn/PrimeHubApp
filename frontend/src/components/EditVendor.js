// src/pages/EditVendor.js (veya sen nerede tutuyorsan)
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import logo from "../assets/prime-logo.png";
import { getAuth } from "firebase/auth";
import { API_ENDPOINTS } from "../config/api";

export default function EditVendor({ isAdmin }) {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const auth = getAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    city: "",
    representative: "",
    contact: "",
    price: "",
    notes: "",
    agreementNumber: "",
    bankAccount: "",
    rating: "",
    images: [] // backend string[] döndürüyorsa uyumlu
  });

  // Label özelleştirmeleri (VOEN eklendi)
  const fieldLabels = {
    name: "Vendor Name",
    category: "Category",
    city: "City",
    representative: "Representative",
    contact: "Contact Info",
    price: "Price ($)",
    notes: "Notes",
    agreementNumber: "Agreement Number",
    bankAccount: "Bank Account (VOEN)",
    rating: "Rating (1–5)"
  };

  // Bu sırayla input üretelim
  const fields = [
    "name",
    "category",
    "city",
    "representative",
    "contact",
    "price",
    "agreementNumber",
    "bankAccount",
    "rating"
  ];

  // === Fetch by ID ===
  useEffect(() => {
    const run = async () => {
      try {
        // token: currentUser varsa ondan, yoksa localStorage fallback
        const user = auth.currentUser;
        const token = user ? await user.getIdToken(true) : localStorage.getItem("token");
        if (!token) {
          alert("User not authenticated! Please login.");
          navigate("/dashboard");
          return;
        }

        const res = await fetch(API_ENDPOINTS.VENDORS.BY_ID(vendorId), {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          // Varsayılan alanlarla merge edelim ki eksikler undefined olmasın
          setFormData(prev => ({
            ...prev,
            ...data,
            id: data.id ?? vendorId,
            images: Array.isArray(data.images) ? data.images : []
          }));
        } else if (res.status === 404) {
          alert("Vendor not found.");
          navigate("/vendor-list");
          return;
        } else if (res.status === 401) {
          alert("Unauthorized! Please login again.");
          navigate("/dashboard");
          return;
        } else {
          const t = await res.text().catch(() => "");
          alert("Failed to load vendor: " + (t || `${res.status} ${res.statusText}`));
          navigate("/vendor-list");
          return;
        }
      } catch (e) {
        console.error(e);
        alert("Network error or server not reachable.");
        navigate("/vendor-list");
        return;
      } finally {
        setLoading(false);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  // === Handlers ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    // numeric alanları normalize edelim (price, rating)
    if (name === "price") {
      setFormData(prev => ({ ...prev, [name]: value === "" ? "" : Number(value) }));
    } else if (name === "rating") {
      setFormData(prev => ({ ...prev, [name]: value === "" ? "" : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken(true) : localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated! Please login.");
        return;
      }

      // Admin değilse price’i backend’e boşuna göndermeyelim (opsiyonel)
      const payload = { ...formData };
      if (!isAdmin) delete payload.price;

      const res = await fetch(API_ENDPOINTS.VENDORS.BY_ID(vendorId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Vendor updated successfully.");
        navigate("/vendor-list");
      } else if (res.status === 401) {
        alert("Unauthorized! Please login again.");
  navigate("/dashboard");
      } else {
        const t = await res.text().catch(() => "");
        alert("Failed to update vendor: " + (t || `${res.status} ${res.statusText}`));
      }
    } catch (e) {
      console.error(e);
      alert("Network error or server not reachable.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 30, fontFamily: "Segoe UI, sans-serif" }}>
        Loading vendor…
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 15,
        fontFamily: "Segoe UI, sans-serif",
        minHeight: "calc(100vh - 120px)",
        backgroundColor: "#f9f9f9",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 30
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
            cursor: "pointer"
          }}
        >
          ← Back to Vendor List
        </button>
      </div>

      {/* Form */}
      <div
        style={{
          backgroundColor: "#fff",
          padding: 30,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          flexGrow: 1
        }}
      >
        <form
          onSubmit={handleSave}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: 20,
            rowGap: 20
          }}
        >
          {fields.map((field) => (
            <div key={field} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontWeight: 600 }}>
                {fieldLabels[field] || field}
              </label>

              <input
                type={
                  field === "price" ? "number" :
                  field === "rating" ? "number" : "text"
                }
                name={field}
                value={formData[field] ?? ""}
                onChange={handleChange}
                disabled={field === "price" ? !isAdmin : false}
                min={field === "rating" ? 0 : undefined}
                max={field === "rating" ? 5 : undefined}
                step={field === "price" ? "0.01" : field === "rating" ? "1" : undefined}
                style={{
                  padding: 10,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                  backgroundColor: field === "price" && !isAdmin ? "#f0f0f0" : "#fff"
                }}
              />
            </div>
          ))}

          {/* Notes textarea */}
          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>{fieldLabels.notes}</label>
            <textarea
              name="notes"
              value={formData.notes ?? ""}
              onChange={handleChange}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", minHeight: 90 }}
            />
          </div>

          {/* Save / Cancel */}
          <div
            style={{
              gridColumn: "span 2",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 10
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/vendor-list")}
              disabled={submitting}
              style={{
                padding: "10px 20px",
                borderRadius: 6,
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 20px",
                borderRadius: 6,
                border: "none",
                backgroundColor: "#d90000",
                color: "#fff",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
