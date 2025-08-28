import React, { useState } from "react";
import logo from "../assets/prime-logo.png"; 

const vendorsMock = [
  { id: 1, category: "Art", city: "New York", representative: "Alice", name: "FaceArt", contact: "123-456-7890", rating: 4.5, price: "$200", notes: "Specializes in murals", images: ["img1.jpg"] },
  { id: 2, category: "Photography", city: "Los Angeles", representative: "Bob", name: "ShutterPro", contact: "987-654-3210", rating: 4.7, price: "$350", notes: "Wedding photographer", images: ["img2.jpg"] },
  { id: 3, category: "Catering", city: "Chicago", representative: "Carol", name: "TastyBites", contact: "555-123-4567", rating: 4.2, price: "$500", notes: "Event catering", images: ["img3.jpg"] },
  { id: 4, category: "Music", city: "Miami", representative: "David", name: "DJ Max", contact: "444-555-6666", rating: 4.8, price: "$400", notes: "Party DJ", images: ["img4.jpg"] },
  { id: 5, category: "Decoration", city: "Houston", representative: "Eva", name: "DreamDecors", contact: "333-222-1111", rating: 4.6, price: "$300", notes: "Event decoration", images: ["img5.jpg"] },
];

const VendorList = ({ isAdmin }) => {
  const [search, setSearch] = useState("");
  const [vendors, setVendors] = useState(vendorsMock);

  const filteredVendors = vendors.filter(v =>
    [v.category, v.city, v.name, v.representative].some(field =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  const handleDelete = (id) => {
    if(window.confirm("Are you sure you want to delete this vendor?")){
      setVendors(vendors.filter(v => v.id !== id));
    }
  };

  return (
    <div style={{ 
      padding: 30, 
      fontFamily: "Segoe UI, sans-serif", 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      backgroundColor: "#f9f9f9" 
    }}>
            <h1 style={{ 
        marginBottom: 20, 
        color: "#000", 
        fontSize: "2rem",
        fontWeight: "bold",
        display: "flex", 
        alignItems: "center", 
        gap: 10
        }}>
        <img src={logo} alt="Logo" style={{ height: 40 }} />
        Vendor <span style={{ color: "#d90000" }}>List</span>
        </h1>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <input 
          type="text"
          placeholder="Search by Name, City or Category"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ 
            padding: 10, 
            width: "60%", 
            borderRadius: 6, 
            border: "1px solid #ccc", 
            fontSize: 16,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)" 
          }}
        />
        <button 
          style={{ 
            backgroundColor: "#d90000", 
            color: "#fff", 
            padding: "10px 20px", 
            borderRadius: 6, 
            border: "none", 
            cursor: "pointer", 
            fontSize: 16,
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)", 
            transition: "0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#b80000"}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = "#d90000"}
        >
          ➕ Add Vendor
        </button>
      </div>

      <table style={{ 
        width: "100%", 
        borderCollapse: "collapse", 
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        borderRadius: 8, 
        overflow: "hidden"
      }}>
        <thead>
          <tr style={{ backgroundColor: "#ff0000ff", color: "#fff", textAlign: "left" }}>
            <th style={{ padding: 10, cursor: "pointer" }}>Category</th>
            <th style={{ padding: 10 }}>City</th>
            <th style={{ padding: 10 }}>Representative</th>
            <th style={{ padding: 10 }}>Name</th>
            <th style={{ padding: 10 }}>Contact</th>
            <th style={{ padding: 10 }}>⭐ Rating</th>
            {isAdmin && <th style={{ padding: 10 }}>💰 Price</th>}
            <th style={{ padding: 10 }}>✏️ Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredVendors.map(v => (
            <tr key={v.id} style={{ borderBottom: "1px solid #ccc", cursor: "pointer", transition: "0.2s", backgroundColor: "#fff" }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#fff"}>
              <td style={{ padding: 10 }}>{v.category}</td>
              <td style={{ padding: 10 }}>{v.city}</td>
              <td style={{ padding: 10 }}>{v.representative}</td>
              <td style={{ padding: 10 }}>{v.name}</td>
              <td style={{ padding: 10 }}>{v.contact}</td>
              <td style={{ padding: 10 }}>{v.rating}</td>
              {isAdmin && <td style={{ padding: 10, color: "#d90000" }}>{v.price}</td>}
              <td style={{ padding: 10 }}>
                <button 
                  onClick={() => alert("Edit " + v.name)} 
                  style={{ 
                    marginRight: 10, 
                    padding: "5px 10px", 
                    backgroundColor: "#000", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  ✏️ Edit
                </button>
                <button 
                  onClick={() => handleDelete(v.id)} 
                  style={{ 
                    padding: "5px 10px", 
                    backgroundColor: "#d90000", 
                    color: "#fff", 
                    border: "none", 
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
                >
                  🗑️ Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <footer style={{ 
        marginTop: "auto", 
        textAlign: "center", 
        padding: 20, 
        marginTop: 40, 
        borderTop: "4px solid #d90000", 
        backgroundColor: "#fff"
      }}>
        <img src={logo} alt="Company Logo" style={{ height: 50, marginBottom: 10 }} />
        <p style={{ color: "#666" }}>© 2025 Prime Vendor. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default VendorList;
// Orkhaner