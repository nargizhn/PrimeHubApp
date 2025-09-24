import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, formatRating } from "../config/api";

const RateVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [userRatings, setUserRatings] = useState({}); // { vendorId: { price, time, quality } }
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const auth = getAuth();
  const navigate = useNavigate();

  // responsive
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  // shared styles aligned with VendorList
  const styles = {
    container: {
      padding: isMobile ? 10 : 20,
      fontFamily: "Segoe UI, sans-serif",
      minHeight: "calc(100vh - 120px)",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#f5f5f5",
    },
    header: { marginBottom: isMobile ? 20 : 30, textAlign: "center" },
    title: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      margin: 0,
      fontSize: isMobile ? 24 : 28,
      fontWeight: "bold",
      color: "#333",
    },
  titleAccent: { color: "#ff2d2d" },
    controls: {
      display: "flex",
      gap: isMobile ? 10 : 20,
      alignItems: isMobile ? "stretch" : "center",
      flexDirection: isMobile ? "column" : "row",
      marginBottom: 30,
      padding: 20,
      backgroundColor: "#fff",
      borderRadius: 12,
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    },
    backBtn: {
      padding: "10px 20px",
      backgroundColor: "#6c757d",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 500,
      transition: "background-color 0.2s",
      width: isMobile ? "100%" : "auto",
    },
    tableWrapper: {
      backgroundColor: "#fff",
      borderRadius: 12,
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      overflow: "hidden",
  borderTop: "3px solid #ff2d2d",
    },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
    th: {
      padding: "15px 10px",
      textAlign: "left",
      fontWeight: "bold",
      borderBottom: "2px solid #dee2e6",
      color: "#495057",
  backgroundColor: "#ffe9e9",
    },
    tr: { borderBottom: "1px solid #dee2e6", transition: "background-color 0.2s" },
    td: { padding: "12px 10px", verticalAlign: "middle", color: "#495057", fontSize: 13 },
    ratingStar: (active) => ({
      background: "none",
      border: "none",
      color: active ? "#ffc107" : "#dee2e6",
      fontSize: 20,
      cursor: "pointer",
      padding: 0,
    }),
    submitBtn: (enabled) => ({
      padding: "8px 16px",
      backgroundColor: enabled ? "#ff2d2d" : "#e9ecef",
      color: enabled ? "#fff" : "#adb5bd",
      border: "none",
      borderRadius: 6,
      cursor: enabled ? "pointer" : "not-allowed",
      fontSize: 14,
      transition: "background-color 0.2s",
    }),
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          Rate <span style={styles.titleAccent}>Vendors</span>
        </h1>
      </div>

      <div style={styles.controls}>
        <button
          onClick={() => navigate("/dashboard")}
          style={styles.backBtn}
          title="Back to Dashboard"
          aria-label="Back to Dashboard"
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#5a6268")}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6c757d")}
        >
          &larr; Back
        </button>
      </div>

      <div style={styles.tableWrapper}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>💸 Price</th>
                <th style={styles.th}>⏱️ Time Mgmt</th>
                <th style={styles.th}>🎯 Quality</th>
                <th style={styles.th}>⭐ Average</th>
                <th style={styles.th}>Submit</th>
              </tr>
            </thead>
            <tbody>
              {vendors.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...styles.td, textAlign: "center", padding: 40, color: "#6c757d", fontStyle: "italic" }}>
                    No vendors found
                  </td>
                </tr>
              ) : (
                vendors.map((v) => {
                  const sel = userRatings[v.id] || {};
                  const enabled = !!(sel.price && sel.time && sel.quality);
                  return (
                    <tr
                      key={v.id}
                      style={styles.tr}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ffefef")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
                    >
                      <td style={styles.td}>{v.name}</td>
                      <td style={styles.td}>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            style={styles.ratingStar((sel.price || 0) >= num)}
                            onClick={() => handleRatingChange(v.id, "price", num)}
                            aria-label={`Set price rating ${num}`}
                          >
                            ★
                          </button>
                        ))}
                      </td>
                      <td style={styles.td}>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            style={styles.ratingStar((sel.time || 0) >= num)}
                            onClick={() => handleRatingChange(v.id, "time", num)}
                            aria-label={`Set time rating ${num}`}
                          >
                            ★
                          </button>
                        ))}
                      </td>
                      <td style={styles.td}>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            style={styles.ratingStar((sel.quality || 0) >= num)}
                            onClick={() => handleRatingChange(v.id, "quality", num)}
                            aria-label={`Set quality rating ${num}`}
                          >
                            ★
                          </button>
                        ))}
                      </td>
                      <td style={{ ...styles.td, fontWeight: 600 }}>{formatRating(v.rating, v.ratingCount)}</td>
                      <td style={styles.td}>
                        <button
                          style={styles.submitBtn(enabled)}
                          disabled={!enabled}
                          onMouseOver={(e) => enabled && (e.currentTarget.style.backgroundColor = "#e31b1b")}
                          onMouseOut={(e) => enabled && (e.currentTarget.style.backgroundColor = "#ff2d2d")}
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
      </div>
    </div>
  );
};

export default RateVendors;
