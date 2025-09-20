import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// import { auth } from "../firebase"; // kullanılmıyor
import {       <main style={{
        ...styles.main,
        ...(isMobile ? {
          marginTop: '60px',
          padding: '20px',
          marginLeft: '0',
        } : {})
      }}>
        <h1 style={{
          ...styles.heading,
          ...(isMobile ? { fontSize: '24px' } : {})
        }}>Welcome Back 👋</h1>
        <p style={styles.subheading}>Here's what's happening with vendors today.</p>

        <div style={styles.contentContainer}>
          {/* Carousel */}
          <div style={{
            ...styles.carousel,
            ...(isMobile ? { padding: '20px' } : {})
          }}>
            <h2 style={{ marginBottom: 5 }}>Recent Events</h2>
            <div style={{
              ...styles.carouselBox,
              ...(isMobile ? { height: '200px' } : {})
            }}> from "firebase/auth";
import { useAuth } from "../auth-context";
import { API_ENDPOINTS } from "../config/api";
import logo from "../assets/prime-logo.png";
import { FaUser, FaList, FaStar } from "react-icons/fa";

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

  return (
    <div style={styles.container}>
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
      <aside style={{
        ...styles.sidebar,
        ...(isMobile ? {
          position: 'fixed',
          top: 0,
          left: showMobileMenu ? 0 : '-100%',
          height: '100vh',
          width: '280px',
          zIndex: 1001,
          transition: 'left 0.3s ease-in-out',
        } : {})
      }}>
        <div style={styles.logoContainer}>
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

      <main style={styles.main}>
        <h1 style={styles.heading}>Welcome Back 👋</h1>
        <p style={styles.subheading}>Here’s what’s happening with vendors today.</p>

        <div style={styles.contentContainer}>
          {/* Carousel */}
          <div style={styles.carousel}>
            <h2 style={{ marginBottom: 5 }}>Recent Events</h2>
            <div style={styles.carouselBox}>
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
          <div style={styles.grid}>
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
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Segoe UI, sans-serif",
    backgroundColor: "#f5f5f5",
    color: "#1c1c1c",
  },
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
    height: "100vh",
    overflowY: "auto",
    padding: "40px 60px",
    boxSizing: "border-box",
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: "28px",
    marginBottom: "10px",
  },
  subheading: {
    fontSize: "16px",
    color: "#666",
    marginBottom: "40px",
  },
  contentContainer: {},
  grid: {
    display: "flex",
    gap: "30px",
    marginBottom: "50px",
  },
  card: {
    flex: 1,
    backgroundColor: "#d90000",
    color: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "600",
  },
  carousel: {
    backgroundColor: "#fff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    marginBottom: "40px",
  },
  carouselBox: {
    height: "350px",
    maxWidth: "700px",
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
