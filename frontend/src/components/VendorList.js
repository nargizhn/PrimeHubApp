import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/prime-logo.png";
import { getAuth } from "firebase/auth";
import InfoTooltip from "./InfoTooltip";
import { API_ENDPOINTS, formatRating } from "../config/api";

export default function VendorList({ isAdmin }) {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const fetchVendors = async () => {
    try {
      const user = auth.currentUser;
      let token = null;

      if (user) {
        token = await user.getIdToken(true);
      } else {
        token = localStorage.getItem("token");
      }

      if (!token) {
        alert("User not authenticated! Please login.");
        return;
      }

      console.log("Sending token:", token.slice(0, 16) + "...");

      const response = await fetch(API_ENDPOINTS.VENDORS.BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVendors(Array.isArray(data) ? data : []);
      } else if (response.status === 401) {
        alert("Unauthorized! Please login again.");
      } else {
        const errText = await response.text().catch(() => "");
        alert(
          "Failed to fetch vendors: " +
            (errText || `${response.status} ${response.statusText}`)
        );
      }
    } catch (err) {
      console.error(err);
      alert("Network error or server not reachable.");
    }
  };

  useEffect(() => {
    fetchVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalized = (s) => (s ?? "").toString().toLowerCase();
  const filteredVendors = vendors.filter((v) =>
    ["category", "city", "name", "representative"].some((f) =>
      normalized(v[f]).includes(normalized(search))
    )
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vendor?")) return;

    const user = auth.currentUser;
    const token = user ? await user.getIdToken(true) : localStorage.getItem("token");

    if (!token) {
      alert("User not authenticated! Please login.");
      return;
    }

    try {
      const res = await fetch(API_ENDPOINTS.VENDORS.BY_ID(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok || res.status === 204) {
        setVendors((prev) => prev.filter((v) => v.id !== id));
      } else {
        const t = await res.text().catch(() => "");
        alert(
          "Failed to delete vendor: " + (t || `${res.status} ${res.statusText}`)
        );
      }
    } catch (e) {
      console.error(e);
      alert("Network error or server not reachable.");
    }
  };

  // isAdmin true ise ekstra "Price" kolonu var
  const columnCount = 7 + (isAdmin ? 1 : 0);

  // Basit buton stilleri
  const btn = {
    base: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      padding: "8px 12px",
      borderRadius: 10,
      border: "1px solid #e5e7eb",
      background: "#fff",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 600,
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    },
    edit: { color: "#1f2937" },
    del: { color: "#991b1b", borderColor: "#fecaca", background: "#fff5f5" },
  };

  return (
    <div
      style={{
        padding: 30,
        fontFamily: "Segoe UI, sans-serif",
        minHeight: "100vh",
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
  <img src={logo} alt="Logo" style={{ height: 40 }} /> Vendor{" "}
  <span style={{ color: "#d90000" }}>List</span>
</h1>

<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center", // hizalama için önemli
  }}
>
  <span
  onClick={() => navigate("/dashboard")}
    style={{
      cursor: "pointer",
      userSelect: "none",
      padding: "8px 12px",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      background: "#fff",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      fontSize: 18,
      fontWeight: "bold",
    }}
    title="Back to Dashboard"
    aria-label="Back to Dashboard"
    role="button"
  >
    &larr;
  </span>

  <input
    type="text"
    placeholder="Search by Name, City or Category"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      padding: 10,
      minWidth: 260,
      flex: "1 1 300px",
      borderRadius: 8,
      border: "1px solid #e5e7eb",
      fontSize: 16,
      background: "#fff",
    }}
  />
  <button
    style={{
      padding: "10px 16px",
      borderRadius: 10,
      border: "none",
      background:
        "linear-gradient(90deg, rgba(217,0,0,1) 0%, rgba(179,0,0,1) 100%)",
      color: "#fff",
      cursor: "pointer",
      fontSize: 15,
      fontWeight: 700,
      boxShadow: "0 6px 14px rgba(217,0,0,0.18)",
    }}
    onClick={() => navigate("/add-vendor")}
  >
    ➕ Add Vendor
  </button>
</div>


      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 6px 14px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                backgroundColor: "#d90000",
                color: "#fff",
                textAlign: "left",
              }}
            >
              <th style={{ padding: 12 }}>Category</th>
              <th style={{ padding: 12 }}>City</th>
              <th style={{ padding: 12 }}>Representative</th>
              <th style={{ padding: 12 }}>Name</th>
              <th style={{ padding: 12 }}>Contact</th>
              <th style={{ padding: 12 }}>⭐ Rating</th>
              {isAdmin && <th style={{ padding: 12 }}>💰 Price</th>}
              <th style={{ padding: 12, width: 260 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td
                  colSpan={columnCount}
                  style={{ padding: 16, textAlign: "center", color: "#666" }}
                >
                  No vendors found
                </td>
              </tr>
            ) : filteredVendors.length === 0 ? (
              <tr>
                <td
                  colSpan={columnCount}
                  style={{ padding: 16, textAlign: "center", color: "#666" }}
                >
                  No vendors match your search
                </td>
              </tr>
            ) : (
              filteredVendors.map((v) => (
                <tr
                  key={v.id ?? `${v.name}-${v.email ?? ""}`}
                  style={{ borderBottom: "1px solid #f3f4f6" }}
                >
                  <td style={{ padding: 12 }}>{v.category}</td>
                  <td style={{ padding: 12 }}>{v.city}</td>
                  <td style={{ padding: 12 }}>{v.representative}</td>
                  <td style={{ padding: 12 }}>{v.name}</td>
                  <td style={{ padding: 12 }}>{v.contact}</td>
                  <td style={{ padding: 12 }}>{formatRating(v.rating, v.ratingCount)}</td>
                  {isAdmin && <td style={{ padding: 12 }}>{v.price ?? ""}</td>}
                  <td style={{ padding: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                      }}
                    >
                      {/* INFO tooltip — buton üstünde görünür, portal ile body'e çizilir */}
                      <InfoTooltip
                        label="ℹ️ Info"
                        rows={[
                          ["Agreement #", v.agreementNumber],
                          ["Bank Account", v.bankAccount],
                          ...(v.notes ? [["Notes", v.notes]] : []),
                        ]}
                      />

                      {/* EDIT */}
                      <button
                        onClick={() => navigate(`/edit-vendor/${v.id}`)}
                        style={{ ...btn.base, ...btn.edit }}
                      >
                        ✏️ Edit
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() => handleDelete(v.id)}
                        style={{ ...btn.base, ...btn.del }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
