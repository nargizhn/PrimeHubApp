// src/components/VendorList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/prime-logo.png";
import { getAuth } from "firebase/auth";
import InfoTooltip from "./InfoTooltip";
import { API_ENDPOINTS, formatRating } from "../config/api";
import { getVendorAttachment, downloadFile } from "../utils/vendorFiles";

export default function VendorList({ isAdmin }) {
    const [vendors, setVendors] = useState([]);
    const [filesByVendor, setFilesByVendor] = useState({}); // { [vendorId]: {name,url,type,size,...} | null }
    const [search, setSearch] = useState("");
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const navigate = useNavigate();
    const auth = getAuth();

    // responsive
    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    // vendorları çek
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
                const data = await res.json();
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

    // her vendor için storage/firestore'dan ek dosya metası çek
    useEffect(() => {
        if (!vendors?.length) return;
        (async () => {
            const entries = await Promise.all(
                vendors.map(async (v) => {
                    try {
                        const meta = await getVendorAttachment(v.id);
                        return [v.id, meta || null];
                    } catch {
                        return [v.id, null];
                    }
                })
            );
            setFilesByVendor(Object.fromEntries(entries));
        })();
    }, [vendors]);

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
                alert("Failed to delete vendor: " + (t || `${res.status} ${res.statusText}`));
            }
        } catch (e) {
            console.error(e);
            alert("Network error or server not reachable.");
        }
    };

    // responsive stiller
    const getResponsiveStyles = () => ({
        container: {
            padding: isMobile ? "10px" : "20px",
            backgroundColor: "#f5f5f5",
            minHeight: "calc(100vh - 120px)",
            fontFamily: "Segoe UI, sans-serif",
        },
        header: {
            marginBottom: isMobile ? "20px" : "30px",
            textAlign: "center",
        },
        title: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontSize: isMobile ? "24px" : "28px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: isMobile ? "20px" : "30px",
        },
        logo: { height: isMobile ? "40px" : "50px", width: "auto" },
        titleAccent: { color: "#d90000" },
        controls: {
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            gap: isMobile ? "10px" : "20px",
            alignItems: isMobile ? "stretch" : "center",
            marginBottom: "30px",
            padding: "20px",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        },
        backBtn: {
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "background-color 0.2s",
            order: isMobile ? 2 : 1,
        },
        searchInput: {
            flex: isMobile ? "none" : 1,
            padding: "10px 15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            fontSize: "14px",
            order: isMobile ? 1 : 2,
        },
        addBtn: {
            padding: "10px 20px",
            backgroundColor: "#d90000",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "background-color 0.2s",
            order: isMobile ? 3 : 3,
        },
        tableContainer: {
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            overflow: "hidden",
        },
    });

    const responsiveStyles = getResponsiveStyles();
    const columnCount = 7 + (isAdmin ? 1 : 0);

    return (
        <div style={responsiveStyles.container}>
            <div style={responsiveStyles.header}>
                <h1 style={responsiveStyles.title}>
                    <img src={logo} alt="Logo" style={responsiveStyles.logo} />
                    Vendor <span style={responsiveStyles.titleAccent}>List</span>
                </h1>
            </div>

            <div style={responsiveStyles.controls}>
                <button
                    onClick={() => navigate("/dashboard")}
                    style={responsiveStyles.backBtn}
                    title="Back to Dashboard"
                    aria-label="Back to Dashboard"
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#5a6268")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6c757d")}
                >
                    &larr; Back
                </button>

                <input
                    type="text"
                    placeholder="Search by Name, City or Category"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={responsiveStyles.searchInput}
                />

                <button
                    style={responsiveStyles.addBtn}
                    onClick={() => navigate("/add-vendor")}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c82333")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#d90000")}
                >
                    ➕ Add Vendor
                </button>
            </div>

            <div style={responsiveStyles.tableContainer}>
                {/* Desktop Table */}
                {!isMobile ? (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                            <thead>
                            <tr style={{ backgroundColor: "#f8f9fa" }}>
                                <th style={styles.tableHeader}>Category</th>
                                <th style={styles.tableHeader}>City</th>
                                <th style={styles.tableHeader}>Representative</th>
                                <th style={styles.tableHeader}>Name</th>
                                <th style={styles.tableHeader}>Contact</th>
                                <th style={styles.tableHeader}>⭐ Rating</th>
                                {isAdmin && <th style={styles.tableHeader}>💰 Price</th>}
                                <th style={styles.tableHeader}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {vendors.length === 0 ? (
                                <tr>
                                    <td colSpan={columnCount} style={styles.noData}>No vendors found</td>
                                </tr>
                            ) : filteredVendors.length === 0 ? (
                                <tr>
                                    <td colSpan={columnCount} style={styles.noData}>No vendors match your search</td>
                                </tr>
                            ) : (
                                filteredVendors.map((v) => {
                                    const meta = filesByVendor[v.id] || null;
                                    const attachmentValue = meta ? (
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                downloadFile(meta.url, meta.name || "vendor_file");
                                            }}
                                            style={{ color: "#93c5fd", textDecoration: "underline" }}
                                            title="Download attachment"
                                        >
                                            {meta.name || "Download"}
                                        </a>
                                    ) : "—";

                                    return (
                                        <tr key={v.id ?? `${v.name}-${v.email ?? ""}`} style={styles.tableRow}>
                                            <td style={styles.tableCell}>{v.category}</td>
                                            <td style={styles.tableCell}>{v.city}</td>
                                            <td style={styles.tableCell}>{v.representative}</td>
                                            <td style={styles.tableCell}>{v.name}</td>
                                            <td style={styles.tableCell}>{v.contact}</td>
                                            <td style={styles.tableCell}>{formatRating(v.rating, v.ratingCount)}</td>
                                            {isAdmin && <td style={styles.tableCell}>{v.price ?? ""}</td>}
                                            <td style={styles.tableCell}>
                                                <div style={styles.actionButtons}>
                                                    {/* Aynı InfoTooltip tasarımını kullan; sadece "Attachment" satırını ekle */}
                                                    <InfoTooltip
                                                        label="ℹ️"
                                                        rows={[
                                                            ["Agreement #", v.agreementNumber],
                                                            ["Bank Account", v.bankAccount],
                                                            ...(v.notes ? [["Notes", v.notes]] : []),
                                                            ["Attachment", attachmentValue], // ✅ burada
                                                        ]}
                                                    />
                                                    <button
                                                        onClick={() => navigate(`/edit-vendor/${v.id}`)}
                                                        style={styles.editBtn}
                                                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#5a6268")}
                                                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6c757d")}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(v.id)}
                                                        style={styles.deleteBtn}
                                                        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c82333")}
                                                        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#dc3545")}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* Mobile Cards */
                    <div style={{ padding: "20px" }}>
                        {vendors.length === 0 ? (
                            <div style={styles.noDataMobile}>No vendors found</div>
                        ) : filteredVendors.length === 0 ? (
                            <div style={styles.noDataMobile}>No vendors match your search</div>
                        ) : (
                            <div style={styles.vendorCards}>
                                {filteredVendors.map((v) => {
                                    const meta = filesByVendor[v.id] || null;
                                    const attachmentValue = meta ? (
                                        <a
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                downloadFile(meta.url, meta.name || "vendor_file");
                                            }}
                                            style={{ color: "#93c5fd", textDecoration: "underline" }}
                                        >
                                            {meta.name || "Download"}
                                        </a>
                                    ) : "—";

                                    return (
                                        <div key={v.id ?? `${v.name}-${v.email ?? ""}`} style={styles.vendorCard}>
                                            <div style={styles.vendorCardHeader}>
                                                <h3 style={styles.vendorCardName}>{v.name}</h3>
                                                <div style={styles.vendorCardRating}>{formatRating(v.rating, v.ratingCount)}</div>
                                            </div>

                                            <div style={styles.vendorCardDetails}>
                                                <div style={styles.vendorDetail}>
                                                    <span style={styles.vendorDetailLabel}>Category:</span>
                                                    <span style={styles.vendorDetailValue}>{v.category}</span>
                                                </div>
                                                <div style={styles.vendorDetail}>
                                                    <span style={styles.vendorDetailLabel}>City:</span>
                                                    <span style={styles.vendorDetailValue}>{v.city}</span>
                                                </div>
                                                <div style={styles.vendorDetail}>
                                                    <span style={styles.vendorDetailLabel}>Representative:</span>
                                                    <span style={styles.vendorDetailValue}>{v.representative}</span>
                                                </div>
                                                <div style={styles.vendorDetail}>
                                                    <span style={styles.vendorDetailLabel}>Contact:</span>
                                                    <span style={styles.vendorDetailValue}>{v.contact}</span>
                                                </div>
                                                {isAdmin && (
                                                    <div style={styles.vendorDetail}>
                                                        <span style={styles.vendorDetailLabel}>Price:</span>
                                                        <span style={styles.vendorDetailValue}>{v.price ?? "N/A"}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div style={styles.vendorCardActions}>
                                                {/* Mobile'de de InfoTooltip tasarımı korunuyor */}
                                                <InfoTooltip
                                                    label="ℹ️ Info"
                                                    rows={[
                                                        ["Agreement #", v.agreementNumber],
                                                        ["Bank Account", v.bankAccount],
                                                        ...(v.notes ? [["Notes", v.notes]] : []),
                                                        ["Attachment", attachmentValue], // ✅ burada
                                                    ]}
                                                />

                                                <button
                                                    onClick={() => navigate(`/edit-vendor/${v.id}`)}
                                                    style={styles.mobileEditBtn}
                                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#5a6268")}
                                                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#6c757d")}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(v.id)}
                                                    style={styles.mobileDeleteBtn}
                                                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c82333")}
                                                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#dc3545")}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Styles (mevcudu bozmadan)
const styles = {
    tableHeader: {
        padding: "15px 10px",
        textAlign: "left",
        fontWeight: "bold",
        borderBottom: "2px solid #dee2e6",
        color: "#495057",
        fontSize: "14px",
    },
    tableRow: {
        borderBottom: "1px solid #dee2e6",
        transition: "background-color 0.2s",
    },
    tableCell: {
        padding: "12px 10px",
        verticalAlign: "middle",
        fontSize: "13px",
        color: "#495057",
    },
    noData: {
        textAlign: "center",
        padding: "40px",
        color: "#6c757d",
        fontStyle: "italic",
    },
    actionButtons: {
        display: "flex",
        gap: "5px",
        alignItems: "center",
    },
    editBtn: {
        padding: "6px 10px",
        backgroundColor: "#6c757d",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
        transition: "background-color 0.2s",
    },
    deleteBtn: {
        padding: "6px 10px",
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
        transition: "background-color 0.2s",
    },

    // Mobile
    noDataMobile: {
        textAlign: "center",
        padding: "40px 20px",
        color: "#6c757d",
        fontStyle: "italic",
        fontSize: "16px",
    },
    vendorCards: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    vendorCard: {
        backgroundColor: "#fff",
        border: "1px solid #dee2e6",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "10px",
    },
    vendorCardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "15px",
        paddingBottom: "10px",
        borderBottom: "1px solid #dee2e6",
    },
    vendorCardName: {
        margin: 0,
        fontSize: "18px",
        fontWeight: "bold",
        color: "#333",
        flex: 1,
    },
    vendorCardRating: {
        fontSize: "14px",
        color: "#ffc107",
        fontWeight: "500",
    },
    vendorCardDetails: {
        marginBottom: "20px",
    },
    vendorDetail: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: "8px",
        marginBottom: "8px",
        borderBottom: "1px solid #f1f3f4",
    },
    vendorDetailLabel: {
        fontWeight: "500",
        color: "#666",
        fontSize: "14px",
        minWidth: "100px",
    },
    vendorDetailValue: {
        color: "#333",
        fontSize: "14px",
        textAlign: "right",
        flex: 1,
    },
    vendorCardActions: {
        display: "flex",
        gap: "10px",
        alignItems: "center",
        flexWrap: "wrap",
    },
    mobileEditBtn: {
        padding: "8px 16px",
        backgroundColor: "#6c757d",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        transition: "background-color 0.2s",
    },
    mobileDeleteBtn: {
        padding: "8px 16px",
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
        transition: "background-color 0.2s",
    },
};
