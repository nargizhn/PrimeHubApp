import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import logo from "../assets/logo 7.png";
import { FaUser, FaList, FaStar } from "react-icons/fa";

import photo1 from "../assets/event1.jpg";
import photo2 from "../assets/event2.jpg";
import photo3 from "../assets/event3.jpg";

const photos = [photo1, photo2, photo3];

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  //   // Auth check
  // React.useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     if (!user) {
  //       navigate("/login");
  //     }
  //   });
  //   return () => unsubscribe();
  // }, [navigate]);


  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
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
            <p>248</p>
          </div>
          <div style={styles.card}>
            <h3>Pending Ratings</h3>
            <p>37</p>
          </div>
          <div style={styles.card}>
            <h3>New Requests</h3>
            <p>12</p>
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
    color: "#1c1c1c"
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#000",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "30px 20px"
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    height: "150px",  
    width: "100px",  
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
    marginBottom: "40px" 
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
    backgroundColor: "#eee",
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
