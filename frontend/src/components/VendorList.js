import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from '../assets/prime-logo.png';
import { getAuth } from "firebase/auth";

export default function VendorList({ isAdmin }) {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const auth = getAuth();

  const fetchVendors = async () => {
    const user = auth.currentUser;
    if (!user) { alert("User not authenticated!"); return; }

    const token = await user.getIdToken(true);
    console.log("Sending token:", token);

    try {
      const response = await fetch("http://localhost:9090/api/vendors", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: "include" // cookie veya session varsa
      });

      if (response.ok) {
        const data = await response.json();
        setVendors(data);
      } else if (response.status === 401) {
        alert("Unauthorized! Please login again.");
      } else {
        const err = await response.text();
        alert("Failed to fetch vendors: " + err);
      }
    } catch (err) {
      console.error(err);
      alert("Network error or server not reachable.");
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const filteredVendors = vendors.filter(v =>
    ["category", "city", "name", "representative"].some(f => v[f]?.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this vendor?")){
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken(true);
      await fetch(`http://localhost:9090/api/vendors/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setVendors(vendors.filter(v => v.id !== id));
    }
  };

  return (
    <div style={{ padding: 30, fontFamily: "Segoe UI, sans-serif", minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
      <h1 style={{ marginBottom: 20, color: "#000", fontSize: "2rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: 10 }}>
        <img src={logo} alt="Logo" style={{ height: 40 }} /> Vendor <span style={{ color: "#d90000" }}>List</span>
      </h1>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <input type="text" placeholder="Search by Name, City or Category" value={search} onChange={e => setSearch(e.target.value)} style={{ padding: 10, width: "60%", borderRadius: 6, border: "1px solid #ccc", fontSize: 16 }} />
        <button style={{ backgroundColor: "#d90000", color: "#fff", padding: "10px 20px", borderRadius: 6, border: "none", cursor: "pointer" }} onClick={() => navigate("/add-vendor")}>➕ Add Vendor</button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#d90000", color: "#fff", textAlign: "left" }}>
            <th style={{ padding: 10 }}>Category</th>
            <th style={{ padding: 10 }}>City</th>
            <th style={{ padding: 10 }}>Representative</th>
            <th style={{ padding: 10 }}>Name</th>
            <th style={{ padding: 10 }}>Contact</th>
            <th style={{ padding: 10 }}>⭐ Rating</th>
            {isAdmin && <th style={{ padding: 10 }}>💰 Price</th>}
            <th style={{ padding: 10 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVendors.map(v => (
            <tr key={v.id} style={{ borderBottom: "1px solid #ccc", cursor: "pointer" }}>
              <td style={{ padding: 10 }}>{v.category}</td>
              <td style={{ padding: 10 }}>{v.city}</td>
              <td style={{ padding: 10 }}>{v.representative}</td>
              <td style={{ padding: 10 }}>{v.name}</td>
              <td style={{ padding: 10 }}>{v.contact}</td>
              <td style={{ padding: 10 }}>{v.rating || ""}</td>
              {isAdmin && <td style={{ padding: 10 }}>{v.price}</td>}
              <td style={{ padding: 10 }}>
                <button onClick={() => navigate(`/edit-vendor/${v.id}`)} style={{ marginRight: 10 }}>✏️ Edit</button>
                <button onClick={() => handleDelete(v.id)}>🗑️ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
