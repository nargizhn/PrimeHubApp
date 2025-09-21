import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { auth } from "../firebase"; // kullanılmıyor
import { getAuth } from "firebase/auth";
import { useAuth } from "../auth-context";
import { API_ENDPOINTS } from "../config/api";
import logo from "../assets/prime-logo.png";
import { FaUser, FaList, FaStar } from "react-icons/fa";
import Footer from "./Footer";

import photo1 from "../assets/event1.jpg";
import photo2 from "../assets/event2.jpg";
import photo3 from "../assets/event3.jpg";

const photos = [photo1, photo2, photo3];

const Dashboard = ({ setUser }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [metrics, setMetrics] = useState({
    total: 0,
    pendingRatings: 0,
    newRequests: 0, // heuristic: agreementNumber boş olanlar
  });

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileMenu(false); // Close mobile menu on desktop
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  // Carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Metrikleri çek
  const fetchMetrics = async () => {
    try {
      const auth = getAuth();
      const fbUser = auth.currentUser;
      const token = fbUser ? await fbUser.getIdToken(true) : localStorage.getItem("token");
      if (!token) {
        // login akışınıza göre burayı değiştirebilirsiniz
        console.warn("No auth token, metrics will stay at 0.");
        return;
      }

      const res = await fetch(API_ENDPOINTS.VENDORS.BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          console.warn("Unauthorized while fetching metrics.");
          return;
        }
        const t = await res.text().catch(() => "");
        console.error("Failed to fetch vendors:", t || `${res.status} ${res.statusText}`);
        return;
      }

      const list = await res.json();
      const vendors = Array.isArray(list) ? list : [];

      const total = vendors.length;

      // Pending = rating alanı boş/undefined/NaN olanlar
      const pendingRatings = vendors.filter(
        (v) => v == null || v.rating == null || Number.isNaN(Number(v.rating))
      ).length;

      // New Requests (heuristic) = agreementNumber boş olanlar
      const newRequests = vendors.filter(
        (v) => !v?.agreementNumber || String(v.agreementNumber).trim() === ""
      ).length;

      setMetrics({ total, pendingRatings, newRequests });
    } catch (e) {
      console.error(e);
      // Tasarıma dokunmamak adına alert koymuyoruz
    }
  };

  useEffect(() => {
    fetchMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get responsive styles
  const getResponsiveStyles = () => ({
    container: {
      ...styles.container,
      ...(isMobile ? {
        flexDirection: 'column',
      } : {})
    },
    sidebar: {
      ...styles.sidebar,
      ...(isMobile ? {
        position: 'fixed',
        top: 0,
        left: showMobileMenu ? 0 : '-100%',
        height: '100vh',
        width: '280px',
        zIndex: 1001,
        transition: 'left 0.3s ease-in-out',
        paddingTop: '20px',
      } : {})
    },
    main: {
      ...styles.main,
      ...(isMobile ? {
        marginTop: '40px',
        marginLeft: '0',
      } : {})
    },
    mainContent: {
      ...styles.mainContent,
      ...(isMobile ? {
        padding: '15px',
      } : {})
    },
    carousel: {
      ...styles.carousel,
      ...(isMobile ? {
        padding: '20px',
      } : {})
    },
    carouselBox: {
      ...styles.carouselBox,
      ...(isMobile ? {
        height: '150px',
      } : {})
    },
    grid: {
      ...styles.grid,
      ...(isMobile ? {
        flexDirection: 'column',
        gap: '15px',
      } : {})
    },
    heading: {
      ...styles.heading,
      ...(isMobile ? {
        fontSize: '24px',
      } : {})
    }
  });

  const responsiveStyles = getResponsiveStyles();

  return (
    <div style={responsiveStyles.container}>
      {/* Mobile Header - only shows on mobile */}
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
          <div style={{ width: 40 }} /> {/* Spacer for centering */}
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobile && showMobileMenu && (
        <div style={styles.mobileOverlay} onClick={() => setShowMobileMenu(false)} />
      )}

      {/* Sidebar */}
      <aside style={responsiveStyles.sidebar}>
        <div style={{
          ...styles.logoContainer,
          ...(isMobile ? {
            marginTop: '15px',
            marginBottom: '20px'
          } : {})
        }}>
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
            <h2 style={{ marginBottom: 5 }}>Recent Events</h2>
            <div style={responsiveStyles.carouselBox}>
              {photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Event ${index + 1}`}
                  style={{
                    ...styles.carouselImage,
                    opacity: index === currentIndex ? 1 : 0,
                    position: "absolute",
                    transition: "opacity 1s ease-in-out",
                  }}
                />
              ))}
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
        
        {/* Footer inside main content */}
        <Footer />
      </main>
    </div>
  );
};

// Original desktop styles preserved exactly as they were
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
    backgroundColor: "#f5f5f5",
    color: "#1c1c1c",
  },
  
  // Mobile-only styles
  mobileHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    zIndex: 1000,
  },
  mobileMenuButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '10px',
  },
  mobileHeaderLogo: {
    height: '40px',
    width: 'auto',
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  
  // Original desktop styles - unchanged
  sidebar: {
    width: "250px",
    backgroundColor: "#000",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "30px 20px",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    height: "150px",
    width: "100px",
    gap: 10,
  },
  logo: {
    height: "100px",
    width: "100px",
  },
  brand: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "16px",
    color: "#fff",
    transition: "0.2s ease",
  },
  icon: {
    marginRight: "10px",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    overflowY: "auto",
    backgroundColor: "#fff",
  },
  mainContent: {
    flex: 1,
    padding: "20px 30px",
    boxSizing: "border-box",
  },
  heading: {
    fontSize: "24px",
    marginBottom: "8px",
  },
  subheading: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px",
  },
  contentContainer: {},
  grid: {
    display: "flex",
    gap: "20px",
    marginBottom: "25px",
  },
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
  carousel: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  carouselBox: {
    height: "250px",
    maxWidth: "600px",
    margin: "0 auto",
    borderRadius: "8px",
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#eee",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
    borderRadius: "8px",
    position: "absolute",
    top: 0,
    left: 0,
  },
};

export default Dashboard;