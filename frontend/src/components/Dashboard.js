import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { useAuth } from "../auth-context";
import { API_ENDPOINTS } from "../config/api";
import logo from "../assets/prime-logo.png";
import { FaUser, FaList, FaStar } from "react-icons/fa";
import Footer from "./Footer";

// Eski fallback görseller
import photo1 from "../assets/event1.jpg";
import photo2 from "../assets/event2.jpg";
import photo3 from "../assets/event3.jpg";

// --- assets/carousel içindeki tüm görselleri otomatik yükle ---
function loadCarouselImages() {
    try {
        const ctx = require.context("../assets/carousel", false, /\.(png|jpe?g|webp|gif)$/i);
        return ctx.keys().map((k) => ctx(k));
    } catch {
        return [];
    }
}

const fallbackPhotos = [photo1, photo2, photo3];

const Dashboard = ({ setUser }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const dynamicPhotos = useMemo(() => loadCarouselImages(), []);
    const photos = dynamicPhotos.length ? dynamicPhotos : fallbackPhotos;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [ratios, setRatios] = useState([]); // her görselin en/boy oranı (width/height)

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const [metrics, setMetrics] = useState({
        total: 0,
        pendingRatings: 0,
        newRequests: 0,
    });

    // Görsellerin doğal en/boy oranını preload ederek al
    useEffect(() => {
        let mounted = true;
        const tmp = [];
        let loaded = 0;

        photos.forEach((src, i) => {
            const img = new Image();
            img.onload = () => {
                if (!mounted) return;
                const r = img.naturalWidth && img.naturalHeight
                    ? img.naturalWidth / img.naturalHeight
                    : 16 / 9;
                tmp[i] = r;
                loaded += 1;
                if (loaded === photos.length) setRatios(tmp);
            };
            img.onerror = () => {
                tmp[i] = 16 / 9;
                loaded += 1;
                if (loaded === photos.length) setRatios(tmp);
            };
            img.src = src;
        });

        return () => {
            mounted = false;
        };
    }, [photos]);

    // Resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth <= 1024;
            setIsMobile(mobile);
            if (!mobile) setShowMobileMenu(false);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate("/login", { replace: true });
        }
    };

    // Carousel autoplay
    useEffect(() => {
        if (photos.length <= 1) return;
        const t = setInterval(() => {
            setCurrentIndex((p) => (p + 1) % photos.length);
        }, 5000);
        return () => clearInterval(t);
    }, [photos.length]);

    // Metrics
    const fetchMetrics = async () => {
        try {
            const auth = getAuth();
            const fbUser = auth.currentUser;
            const token = fbUser ? await fbUser.getIdToken(true) : localStorage.getItem("token");
            if (!token) {
                console.warn("No auth token, metrics will stay at 0.");
                return;
            }

            const res = await fetch(API_ENDPOINTS.VENDORS.BASE, {
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            });
            if (!res.ok) {
                if (res.status === 401) return;
                const t = await res.text().catch(() => "");
                console.error("Failed to fetch vendors:", t || `${res.status} ${res.statusText}`);
                return;
            }

            const list = await res.json();
            const vendors = Array.isArray(list) ? list : [];

            const toInt = (x) => {
                const n = Number(x);
                return Number.isFinite(n) ? n : 0;
            };
            const normalized = vendors.map((v) => ({
                ...v,
                ratingCount: toInt(v?.ratingCount),
                agreementNumber: (v?.agreementNumber ?? "").toString(),
            }));

            setMetrics({
                total: normalized.length,
                pendingRatings: normalized.filter((v) => v.ratingCount === 0).length,
                newRequests: normalized.filter((v) => !v.agreementNumber.trim()).length,
            });
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchMetrics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const prevSlide = () => setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
    const nextSlide = () => setCurrentIndex((i) => (i + 1) % photos.length);

    // Responsive styles
    const getResponsiveStyles = () => ({
        container: {
            ...styles.container,
            ...(isMobile ? { flexDirection: "column" } : {}),
        },
        sidebar: {
            ...styles.sidebar,
            ...(isMobile
                ? {
                    position: "fixed",
                    top: 0,
                    left: showMobileMenu ? 0 : "-100%",
                    height: "100vh",
                    width: "280px",
                    zIndex: 1001,
                    transition: "left 0.3s ease-in-out",
                    paddingTop: "20px",
                }
                : {}),
        },
        main: {
            ...styles.main,
            ...(isMobile ? { marginTop: "40px", marginLeft: "0" } : {}),
        },
        mainContent: {
            ...styles.mainContent,
            ...(isMobile ? { padding: "15px" } : {}),
        },
        carousel: {
            ...styles.carousel,
            ...(isMobile ? { padding: "16px" } : {}),
        },
        carouselBox: {
            ...styles.carouselBox,
            // kutu yüksekliği aktif görselin oranına göre dinamik
            aspectRatio: ratios[currentIndex] || 16 / 9,
            maxWidth: isMobile ? "100%" : 360,
        },
        grid: {
            ...styles.grid,
            ...(isMobile ? { flexDirection: "column", gap: "15px" } : {}),
        },
        heading: {
            ...styles.heading,
            ...(isMobile ? { fontSize: "24px" } : {}),
        },
    });
    const responsiveStyles = getResponsiveStyles();

    return (
        <div style={responsiveStyles.container}>
            {/* Mobile Header */}
            {isMobile && (
                <div style={styles.mobileHeader}>
                    <button
                        style={styles.mobileMenuButton}
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        aria-label="Toggle menu"
                    >
                        ☰
                    </button>
                    <img src={logo} alt="Logo" style={styles.mobileHeaderLogo} />
                    <div style={{ width: 40 }} />
                </div>
            )}

            {/* Overlay */}
            {isMobile && showMobileMenu && (
                <div style={styles.mobileOverlay} onClick={() => setShowMobileMenu(false)} />
            )}

            {/* Sidebar */}
            <aside style={responsiveStyles.sidebar}>
                <div
                    style={{
                        ...styles.logoContainer,
                        ...(isMobile ? { marginTop: "15px", marginBottom: "20px" } : {}),
                    }}
                >
                    <img src={logo} alt="Logo" style={styles.logo} />
                    <h2 style={styles.brand}>Prime Vendor Dashboard</h2>
                </div>
                <nav style={styles.nav}>
                    <div style={styles.navItem} onClick={() => navigate("/profile")}>
                        <FaUser size={18} style={styles.icon} /> My Profile
                    </div>
                    <div style={styles.navItem} onClick={() => navigate("/vendor-list")}>
                        <FaList size={18} style={styles.icon} /> Vendor List
                    </div>
                    <div style={styles.navItem} onClick={() => navigate("/rate-vendors")}>
                        <FaStar size={18} style={styles.icon} /> Rate Vendors
                    </div>
                    <div style={styles.navItem} onClick={handleLogout}>
                        🚪 Logout
                    </div>
                </nav>
            </aside>

            <main style={responsiveStyles.main}>
                <div style={responsiveStyles.mainContent}>
                    <h1 style={responsiveStyles.heading}>Welcome Back 👋</h1>
                    <p style={styles.subheading}>Here's what's happening with vendors today.</p>

                    <div style={styles.contentContainer}>
                        {/* Carousel */}
                        <div style={responsiveStyles.carousel}>
                            <h2 style={{ marginBottom: 8 }}>Recent Events</h2>

                            <div style={responsiveStyles.carouselBox}>
                                {/* Yalnızca görünür resmi render et (contain + oran eşleşti, gri yok) */}
                                <img
                                    src={photos[currentIndex]}
                                    alt={`Event ${currentIndex + 1}`}
                                    style={styles.carouselImage}
                                    draggable={false}
                                />

                                {photos.length > 1 && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={prevSlide}
                                            aria-label="Previous"
                                            style={{ ...styles.arrowBtn, left: 12 }}
                                        >
                                            ‹
                                        </button>
                                        <button
                                            type="button"
                                            onClick={nextSlide}
                                            aria-label="Next"
                                            style={{ ...styles.arrowBtn, right: 12 }}
                                        >
                                            ›
                                        </button>
                                    </>
                                )}

                                {photos.length > 1 && (
                                    <div style={styles.dots}>
                                        {photos.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setCurrentIndex(i)}
                                                aria-label={`Go to slide ${i + 1}`}
                                                style={{
                                                    ...styles.dot,
                                                    ...(i === currentIndex ? styles.dotActive : {}),
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cards */}
                        <div style={responsiveStyles.grid}>
                            <div style={styles.card}>
                                <h3>Total Vendors</h3>
                                <p>{metrics.total}</p>
                            </div>
                            <div style={styles.card}>
                                <h3>Pending Ratings</h3>
                                <p>{metrics.pendingRatings}</p>
                            </div>
                            <div style={styles.card}>
                                <h3>New Requests</h3>
                                <p>{metrics.newRequests}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        </div>
    );
};

// Styles (tema: kırmızı/siyah/beyaz)
const styles = {
    container: {
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#f5f5f5",
        color: "#1c1c1c",
    },

    // Mobile
    mobileHeader: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        zIndex: 1000,
    },
    mobileMenuButton: {
        background: "none",
        border: "none",
        color: "#fff",
        fontSize: "24px",
        cursor: "pointer",
        padding: "10px",
    },
    mobileHeaderLogo: { height: "40px", width: "auto" },
    mobileOverlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 1000,
    },

    // Sidebar
    sidebar: {
        width: "250px",
        backgroundColor: "#000",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "30px 20px",
    },
    logoContainer: { display: "flex", alignItems: "center", height: "150px", width: "100px", gap: 10 },
    logo: { height: "100px", width: "100px" },
    brand: { fontSize: "20px", fontWeight: "bold" },
    nav: { display: "flex", flexDirection: "column", gap: "20px" },
    navItem: {
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        fontSize: "16px",
        color: "#fff",
        transition: "0.2s ease",
    },
    icon: { marginRight: "10px" },

    // Main
    main: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        overflowY: "auto",
        backgroundColor: "#fff",
    },
    mainContent: { flex: 1, padding: "20px 30px", boxSizing: "border-box" },
    heading: { fontSize: "24px", marginBottom: "8px" },
    subheading: { fontSize: "14px", color: "#666", marginBottom: "20px" },
    contentContainer: {},

    // Cards
    grid: { display: "flex", gap: "20px", marginBottom: "25px" },
    card: {
        flex: 1,
        backgroundColor: "#d90000",
        color: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        textAlign: "center",
        fontSize: "16px",
        fontWeight: "600",
    },

    // Carousel
    carousel: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        marginBottom: "20px",
    },
    carouselBox: {
        width: "100%",
        maxWidth: 900,
        margin: "0 auto",
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "#fff", // gri yerine beyaz, ama oran eşleştiği için görünmez
        display: "block",
    },
    carouselImage: {
        width: "100%",
        height: "100%",
        objectFit: "contain", // kesme yok, görüntü orijinali gibi
        display: "block",
    },

    // Controls
    arrowBtn: {
        position: "absolute",
        top: "50%",
        transform: "translateY(-50%)",
        background: "rgba(0,0,0,0.5)",
        color: "#fff",
        border: "none",
        width: 36,
        height: 36,
        borderRadius: "50%",
        cursor: "pointer",
        fontSize: 20,
        lineHeight: "36px",
        textAlign: "center",
        zIndex: 2,
        userSelect: "none",
    },
    dots: {
        position: "absolute",
        bottom: 10,
        left: 0,
        right: 0,
        display: "flex",
        gap: 8,
        justifyContent: "center",
        zIndex: 2,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: "#fff",
        border: "2px solid #d90000",
        opacity: 0.8,
        cursor: "pointer",
    },
    dotActive: {
        background: "#d90000",
        opacity: 1,
    },
};

export default Dashboard;
