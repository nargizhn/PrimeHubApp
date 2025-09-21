// src/components/Footer.jsx
import React from "react";

export default function Footer() {
    const year = new Date().getFullYear();
    
    // Add the gradient animation styles
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        `;
        document.head.appendChild(style);
        
        return () => {
            document.head.removeChild(style);
        };
    }, []);
    
    return (
        <footer
            style={{
                borderTop: "1px solid #e5e7eb",
                padding: "16px",
                color: "#6b7280",
                background: "#fff",
                fontSize: 14,
                position: "relative",
                zIndex: 999,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "16px",
            }}
        >
            <div style={{ textAlign: "left" }}>
                © {year} {" "}
                <span
                    style={{
                        background: "linear-gradient(135deg, #dc2626 0%, #991b1b 25%, #7f1d1d 50%, #450a0a 75%, #1c1917 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        backgroundSize: "200% 200%",
                        animation: "gradientShift 4s ease infinite",
                        fontWeight: "700",
                        letterSpacing: "0.5px",
                        fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                >
                 Prime Agency
                </span>                
            </div>
            <div style={{ fontSize: "12px", color: "#9ca3af", textAlign: "right" }}>
                made with{" "}
                <a 
                    href="https://meridiana.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: "#3b82f6",
                        fontWeight: "700",
                        textDecoration: "none",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        backgroundSize: "200% 200%",
                        animation: "gradientShift 4s ease infinite",
                        letterSpacing: "1px",
                        fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
                        textTransform: "uppercase",
                        fontSize: "11px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        position: "relative",
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = "scale(1.05)";
                        e.target.style.letterSpacing = "1.5px";
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = "scale(1)";
                        e.target.style.letterSpacing = "1px";
                    }}
                >
                    Meridiana Studios
                </a>
            </div>
        </footer>
    );
}
