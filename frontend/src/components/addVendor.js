import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/prime-logo.png';
import { getAuth } from "firebase/auth";

export default function AddVendor() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
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
    images: null
  });

  // 🔽 Buraya ekle
  const fieldLabels = {
    name: "Vendor Name",
    category: "Category",
    city: "City",
    representative: "Representative",
    contact: "Contact Info",
    price: "Price ($)",
    agreementNumber: "Agreement Number",
    bankAccount: "Bank Account (VOEN)" 
  };


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken(true);
    }
    return localStorage.getItem("token");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basit validasyon
    if (!formData.name?.trim()) {
      alert("Name is required.");
      return;
    }

    const token = await getToken();
    if (!token) {
      alert("User not authenticated! Please login.");
      return;
    }

    // Backend’in beklediği şemaya uygun bir payload hazırla
    const payload = {
      name: formData.name?.trim(),
      category: formData.category?.trim() || undefined,
      city: formData.city?.trim() || undefined,
      representative: formData.representative?.trim() || undefined,
      contact: formData.contact?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
      agreementNumber: formData.agreementNumber?.trim() || undefined,
      bankAccount: formData.bankAccount?.trim() || undefined,
      // price boşsa hiç gönderme; doluysa number'a çevir
      ...(formData.price !== "" ? { price: Number(formData.price) } : {}),
      // Şimdilik sadece dosya adını liste olarak gönderiyoruz
      images: formData.images ? [formData.images.name] : []
    };

    setSubmitting(true);
    try {
      const res = await fetch("http://localhost:9090/api/vendors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // İsteğe bağlı: dönen vendor'ı kullanmak istersen:
        // const created = await res.json().catch(() => null);
        alert("Vendor added successfully!");
        navigate("/vendor-list"); // VendorList mount’ta fetch yapacağı için güncel listeyi göreceksin
      } else if (res.status === 401) {
        alert("Unauthorized! Please login again.");
      } else {
        const errText = await res.text().catch(() => "");
        alert("Failed to add vendor: " + (errText || `${res.status} ${res.statusText}`));
      }
    } catch (err) {
      console.error("Error:", err);
      // İstediğin gibi aynı mesaj
      alert("Network error or server not reachable.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: "Segoe UI, sans-serif", minHeight: "100vh", backgroundColor: "#f9f9f9", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} alt="Logo" style={{ height: 40 }} />
          <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>➕ Add <span style={{ color: "#d90000" }}>Vendor</span></h1>
        </div>
        <button
          onClick={() => navigate("/vendor-list")}
          style={{ background: "none", border: "none", color: "#d90000", fontSize: 16, cursor: "pointer" }}
        >
          ← Back to Vendor List
        </button>
      </div>

      <div style={{ backgroundColor: "#fff", padding: 30, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", flexGrow: 1 }}>
        <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 50, rowGap: 20 }}>
          {["name", "category", "city", "representative", "contact", "price", "agreementNumber", "bankAccount"].map((field) => (
            <div key={field} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <label style={{ fontWeight: 600 }}> {fieldLabels[field] || field} </label>

              <input
                type={field === "price" ? "number" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", width: "100%" }}
                required={field === "name"}
                step={field === "price" ? "0.01" : undefined}
                min={field === "price" ? "0" : undefined}
              />
            </div>
          ))}

          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontWeight: 600 }}>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", minHeight: 80, width: "100%" }}
            />
          </div>

          <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
            <label style={{ fontWeight: 600 }}>Upload Images</label>
            <input type="file" name="images" onChange={handleChange} style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc" }} />
            {formData.images && (
              <div style={{ color: "#666", fontSize: 14 }}>
                Selected: <strong>{formData.images.name}</strong>
              </div>
            )}
          </div>

          <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 20px",
                borderRadius: 6,
                border: "none",
                backgroundColor: submitting ? "#999" : "#d90000",
                color: "#fff",
                cursor: submitting ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8
              }}
            >
              {submitting ? "Saving..." : "Save Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
