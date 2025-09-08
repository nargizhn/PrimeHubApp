// src/components/InfoTooltip.jsx
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function InfoTooltip({ label = "ℹ️ Info", rows = [] }) {
  const btnRef = useRef(null);
  const tipRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const calcPosition = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // yaklaşık genişlik; clamp için kullanıyoruz
    const TIP_W = 300;
    let left = r.left + scrollX;
    const maxLeft = scrollX + window.innerWidth - TIP_W - 8;
    if (left > maxLeft) left = Math.max(scrollX + 8, maxLeft);

    const top = r.bottom + scrollY + 8;
    setPos({ top, left });
  };

  useEffect(() => {
    if (!open) return;
    calcPosition();
    const onScroll = () => calcPosition();
    const onResize = () => calcPosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  // hover yönetimi: buton ya da tooltip üzerindeyken açık kalsın
  const [hoverBtn, setHoverBtn] = useState(false);
  const [hoverTip, setHoverTip] = useState(false);
  useEffect(() => {
    if (!hoverBtn && !hoverTip) {
      const t = setTimeout(() => setOpen(false), 120);
      return () => clearTimeout(t);
    }
  }, [hoverBtn, hoverTip]);

  return (
    <>
      <button
        ref={btnRef}
        onMouseEnter={() => { setHoverBtn(true); setOpen(true); }}
        onMouseLeave={() => setHoverBtn(false)}
        onClick={() => setOpen((o) => !o)}
        aria-label="Vendor extra info"
        style={{
          padding: "8px 12px",
          background: "#ede9fe",
          color: "#5b21b6",
          border: "1px solid #ddd6fe",
          borderRadius: 999,
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        }}
      >
        {label}
      </button>

      {open &&
        createPortal(
          <div
            ref={tipRef}
            onMouseEnter={() => setHoverTip(true)}
            onMouseLeave={() => setHoverTip(false)}
            style={{
              position: "absolute",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
              minWidth: 260,
              maxWidth: 320,
              background: "#111827",
              color: "#F9FAFB",
              borderRadius: 12,
              padding: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
              border: "1px solid #1f2937",
            }}
          >
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 14, opacity: 0.9 }}>
              Vendor Details
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr", gap: "6px 10px", fontSize: 13 }}>
              {rows.map(([k, v]) => (
                <React.Fragment key={k}>
                  <div style={{ color: "#9CA3AF" }}>{k}</div>
                  <div style={{ color: "#F3F4F6" }}>{v || "—"}</div>
                </React.Fragment>
              ))}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
