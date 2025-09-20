// src/components/Footer.jsx
import React from "react";

export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer
            style={{
                borderTop: "1px solid #e5e7eb",
                padding: "16px",
                textAlign: "center",
                color: "#6b7280",
                background: "#fff",
                fontSize: 14,
            }}
        >
            © {year} C Prime Agency. All rights reserved.
        </footer>
    );
}
