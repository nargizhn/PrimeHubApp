import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";
import { API_ENDPOINTS } from "../config/api";

const RateVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [userRatings, setUserRatings] = useState({}); // { vendorId: { price, time, quality } }
  const auth = getAuth();

  const fetchVendors = async () => {
    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken(true) : localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated! Please login.");
        return;
      }

      const res = await fetch(API_ENDPOINTS.VENDORS.BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json(); // ✅ JSON'u sadece 1 kez oku
        setVendors(Array.isArray(data) ? data : []);
      } else if (res.status === 401) {
        alert("Unauthorized! Please login again.");
      } else {
        const t = await res.text().catch(() => "");
        alert("Failed to fetch vendors: " + (t || `${res.status} ${res.statusText}`));
      }
    } catch (e) {
      console.error(e);
      alert("Network error or server not reachable.");
    }
  };

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRatingChange = (vendorId, field, value) => {
    setUserRatings((prev) => ({
      ...prev,
      [vendorId]: {
        ...(prev[vendorId] || {}),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (vendor) => {
    const sel = userRatings[vendor.id];
    if (!sel?.price || !sel?.time || !sel?.quality) return;

    const avg = Number(((sel.price + sel.time + sel.quality) / 3).toFixed(2));

    try {
      const user = auth.currentUser;
      const token = user ? await user.getIdToken(true) : localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated! Please login.");
        return;
      }

      const res = await fetch(API_ENDPOINTS.VENDORS.RATING(vendor.id), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: avg }),
      });

      if (res.ok) {
        const updated = await res.json().catch(() => ({ ...vendor, rating: avg }));
        setVendors((prev) => prev.map((v) => (v.id === vendor.id ? updated : v)));
        setUserRatings((prev) => ({ ...prev, [vendor.id]: {} }));
      } else if (res.status === 401) {
        alert("Unauthorized! Please login again.");
      } else {
        const t = await res.text().catch(() => "");
        alert("Failed to submit rating: " + (t || `${res.status} ${res.statusText}`));
      }
    } catch (e) {
      console.error(e);
      alert("Network error or server not reachable.");
    }
  };

  return (
    <div
      style={{
        padding: 30,
        fontFamily: "Segoe UI, sans-serif",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#f9f9f9",
      }}
    >
      <h1
        style={{
          marginBottom: 20,
          color: "#000",
          fontSize: "2rem",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Link
          to="/"
          style={{
            textDecoration: "none",
            cursor: "pointer",
            userSelect: "none",
            padding: "4px 8px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            color: "inherit",
          }}
          title="Back to Dashboard"
          aria-label="Back to Dashboard"
          role="button"
        >
          &larr;
        </Link>
        Rate <span style={{ color: "#d90000" }}>Vendors</span>
      </h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: 8,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: "#ff0000ff",
              color: "#fff",
              textAlign: "left",
            }}
          >
            <th style={{ padding: 10 }}>Name</th>
            <th style={{ padding: 10 }}>💸 Price</th>
            <th style={{ padding: 10 }}>⏱️ Time Mgmt</th>
            <th style={{ padding: 10 }}>🎯 Quality</th>
            <th style={{ padding: 10 }}>⭐ Average</th>
            <th style={{ padding: 10 }}>Submit</th>
          </tr>
        </thead>
        <tbody>
          {vendors.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: 16, textAlign: "center", color: "#666" }}>
                No vendors found
              </td>
            </tr>
          ) : (
            vendors.map((v) => {
              const sel = userRatings[v.id] || {};
              return (
                <tr
                  key={v.id}
                  style={{ borderBottom: "1px solid #eee", backgroundColor: "#fff" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                >
                  <td style={{ padding: 10 }}>{v.name}</td>
                  <td style={{ padding: 10 }}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        style={{
                          background: "none",
                          border: "none",
                          color: sel.price === num ? "#d90000" : "#ccc",
                          fontSize: 20,
                          cursor: "pointer",
                        }}
                        onClick={() => handleRatingChange(v.id, "price", num)}
                      >
                        ★
                      </button>
                    ))}
                  </td>
                  <td style={{ padding: 10 }}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        style={{
                          background: "none",
                          border: "none",
                          color: sel.time === num ? "#d90000" : "#ccc",
                          fontSize: 20,
                          cursor: "pointer",
                        }}
                        onClick={() => handleRatingChange(v.id, "time", num)}
                      >
                        ★
                      </button>
                    ))}
                  </td>
                  <td style={{ padding: 10 }}>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        style={{
                          background: "none",
                          border: "none",
                          color: sel.quality === num ? "#d90000" : "#ccc",
                          fontSize: 20,
                          cursor: "pointer",
                        }}
                        onClick={() => handleRatingChange(v.id, "quality", num)}
                      >
                        ★
                      </button>
                    ))}
                  </td>
                  <td style={{ padding: 10, fontWeight: 600, color: "#d90000" }}>
                    {v.rating ?? "-"}
                  </td>
                  <td style={{ padding: 10 }}>
                    <button
                      style={{
                        backgroundColor: "#d90000",
                        color: "#fff",
                        padding: "6px 14px",
                        borderRadius: 6,
                        border: "none",
                        cursor: sel.price && sel.time && sel.quality ? "pointer" : "not-allowed",
                        fontSize: 16,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                      }}
                      disabled={!(sel.price && sel.time && sel.quality)}
                      onClick={() => handleSubmit(v)}
                    >
                      Submit
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RateVendors;
