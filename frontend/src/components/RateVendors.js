import React, { useState } from 'react';

const initialVendors = [
  { id: 1, name: 'Vendor A', ratings: [5, 4, 3] },
  { id: 2, name: 'Vendor B', ratings: [4, 4] },
  { id: 3, name: 'Vendor C', ratings: [3, 2, 5, 4] },
];

function getAverage(ratings) {
  if (!ratings.length) return 0;
  return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
}

const RateVendors = () => {
  const [vendors, setVendors] = useState(initialVendors);
  const [userRatings, setUserRatings] = useState({}); // { vendorId: rating }

  const handleRate = (vendorId, rating) => {
    setUserRatings({ ...userRatings, [vendorId]: rating });
  };

  const handleSubmit = (vendorId) => {
    const rating = userRatings[vendorId];
    if (!rating) return;
    setVendors(vendors.map(v =>
      v.id === vendorId
        ? { ...v, ratings: [...v.ratings, rating] }
        : v
    ));
    setUserRatings({ ...userRatings, [vendorId]: undefined });
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 24 }}>Rate Vendors</h2>
      <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {vendors.map(vendor => (
          <div key={vendor.id} style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12
          }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{vendor.name}</div>
            <div style={{ color: '#dc2626', fontWeight: 500 }}>
              Average Rating: {getAverage(vendor.ratings)}
              {/* Show stars for average */}
              <span style={{ marginLeft: 8 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: i < Math.round(getAverage(vendor.ratings)) ? '#dc2626' : '#e5e7eb', fontSize: 18 }}>
                    ★
                  </span>
                ))}
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 500 }}>Your Rating:</span>
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: userRatings[vendor.id] > i ? '#dc2626' : '#e5e7eb',
                    fontSize: 22,
                    marginLeft: 2,
                  }}
                  onClick={() => handleRate(vendor.id, i + 1)}
                >
                  ★
                </button>
              ))}
            </div>
            <button
              style={{
                marginTop: 8,
                backgroundColor: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 16px',
                fontWeight: 500,
                cursor: userRatings[vendor.id] ? 'pointer' : 'not-allowed',
                opacity: userRatings[vendor.id] ? 1 : 0.6
              }}
              disabled={!userRatings[vendor.id]}
              onClick={() => handleSubmit(vendor.id)}
            >
              Submit Rating
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RateVendors;