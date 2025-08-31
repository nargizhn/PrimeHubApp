import React, { useState } from "react";

const initialVendors = [
  { id: 1, name: "Vendor A", ratings: [] },
  { id: 2, name: "Vendor B", ratings: [] },
  { id: 3, name: "Vendor C", ratings: [] },
];

function getAverage(ratingObj) {
  const vals = Object.values(ratingObj).filter((v) => typeof v === "number");
  if (!vals.length) return "-";
  return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
}

const RateVendors = () => {
  const [vendors, setVendors] = useState(initialVendors);
  const [userRatings, setUserRatings] = useState({}); // { vendorId: { price, time, quality } }

  const handleRatingChange = (vendorId, field, value) => {
    setUserRatings({
      ...userRatings,
      [vendorId]: {
        ...userRatings[vendorId],
        [field]: value,
      },
    });
  };

  const handleSubmit = (vendorId) => {
    const rating = userRatings[vendorId];
    if (!rating || !rating.price || !rating.time || !rating.quality) return;
    setVendors(
      vendors.map((v) =>
        v.id === vendorId
          ? { ...v, ratings: [...v.ratings, rating] }
          : v
      )
    );
    setUserRatings({ ...userRatings, [vendorId]: {} });
  };

  // Calculate averages for each vendor
  const getVendorAverages = (vendor) => {
    if (!vendor.ratings.length)
      return { price: "-", time: "-", quality: "-", avg: "-" };
    const priceAvg = (
      (vendor.ratings.reduce((a, b) => a + b.price, 0) / vendor.ratings.length)
        .toFixed(2)
    );
    const timeAvg = (
      (vendor.ratings.reduce((a, b) => a + b.time, 0) / vendor.ratings.length)
        .toFixed(2)
    );
    const qualityAvg = (
      (vendor.ratings.reduce((a, b) => a + b.quality, 0) / vendor.ratings.length)
        .toFixed(2)
    );
    const avg = ((+priceAvg + +timeAvg + +qualityAvg) / 3).toFixed(2);
    return { price: priceAvg, time: timeAvg, quality: qualityAvg, avg };
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
        Rate{" "}
        <span style={{ color: "#d90000" }}>
          Vendors
        </span>
      </h1>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          borderRadius: 8,
          overflow: "hidden",
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
          {vendors.map((v) => {
            const averages = getVendorAverages(v);
            return (
              <tr
                key={v.id}
                style={{
                  borderBottom: "1px solid #ccc",
                  backgroundColor: "#fff",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f5f5f5")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#fff")
                }
              >
                <td style={{ padding: 10 }}>{v.name}</td>
                <td style={{ padding: 10 }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      style={{
                        background: "none",
                        border: "none",
                        color:
                          userRatings[v.id]?.price === num
                            ? "#d90000"
                            : "#ccc",
                        fontSize: 20,
                        cursor: "pointer",
                      }}
                      onClick={() => handleRatingChange(v.id, "price", num)}
                    >
                      ★
                    </button>
                  ))}
                  <span
                    style={{
                      marginLeft: 8,
                      color: "#d90000",
                      fontWeight: 500,
                    }}
                  >
                    {averages.price}
                  </span>
                </td>
                <td style={{ padding: 10 }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      style={{
                        background: "none",
                        border: "none",
                        color:
                          userRatings[v.id]?.time === num ? "#d90000" : "#ccc",
                        fontSize: 20,
                        cursor: "pointer",
                      }}
                      onClick={() => handleRatingChange(v.id, "time", num)}
                    >
                      ★
                    </button>
                  ))}
                  <span
                    style={{
                      marginLeft: 8,
                      color: "#d90000",
                      fontWeight: 500,
                    }}
                  >
                    {averages.time}
                  </span>
                </td>
                <td style={{ padding: 10 }}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      style={{
                        background: "none",
                        border: "none",
                        color:
                          userRatings[v.id]?.quality === num ? "#d90000" : "#ccc",
                        fontSize: 20,
                        cursor: "pointer",
                      }}
                      onClick={() => handleRatingChange(v.id, "quality", num)}
                    >
                      ★
                    </button>
                  ))}
                  <span
                    style={{
                      marginLeft: 8,
                      color: "#d90000",
                      fontWeight: 500,
                    }}
                  >
                    {averages.quality}
                  </span>
                </td>
                <td
                  style={{
                    padding: 10,
                    fontWeight: 600,
                    color: "#d90000",
                  }}
                >
                  {averages.avg}
                </td>
                <td style={{ padding: 10 }}>
                  <button
                    style={{
                      backgroundColor: "#d90000",
                      color: "#fff",
                      padding: "6px 14px",
                      borderRadius: 6,
                      border: "none",
                      cursor:
                        userRatings[v.id]?.price &&
                        userRatings[v.id]?.time &&
                        userRatings[v.id]?.quality
                          ? "pointer"
                          : "not-allowed",
                      fontSize: 16,
                      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    }}
                    disabled={
                      !(
                        userRatings[v.id]?.price &&
                        userRatings[v.id]?.time &&
                        userRatings[v.id]?.quality
                      )
                    }
                    onClick={() => handleSubmit(v.id)}
                  >
                    Submit
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* ...footer if needed... */}
    </div>
  );
};

export default RateVendors;