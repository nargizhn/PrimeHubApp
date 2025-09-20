import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import VendorList from "./components/VendorList";
import RateVendors from "./components/RateVendors";
import LoginSignup from "./components/LoginSignup";
import EditVendor from "./components/EditVendor";
import AddVendor from "./components/addVendor";
import { useAuth } from "./auth-context";
import Footer from "./components/Footer"; // ✅ eklendi

function App() {
    const { user, checking } = useAuth();
    const isAdmin = true;

    if (checking) {
        return <div style={{textAlign:'center',marginTop:60,fontSize:22}}>Loading...</div>;
    }

    // Guard'lar aynı kalsın
    const Public = ({ children }) => (user ? <Navigate to="/dashboard" replace /> : children);
    const Protected = ({ children }) => (user ? children : <Navigate to="/login" replace />);

    return (
        <Router basename={process.env.PUBLIC_URL}>
            {/* sayfayı dikeyde doldur + footer'ı alta sabitle */}
            <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#fff" }}>
                <main style={{ flex: 1 }}>
                    <Routes>
                        {/* kök her zaman login'e */}
                        <Route path="/" element={<Navigate to="/login" replace />} />

                        {/* Public */}
                        <Route path="/login"  element={<Public><LoginSignup /></Public>} />
                        <Route path="/signup" element={<Public><LoginSignup isLogin={false} /></Public>} />

                        {/* Protected */}
                        <Route path="/dashboard"    element={<Protected><Dashboard /></Protected>} />
                        <Route path="/profile"      element={<Protected><Profile /></Protected>} />
                        <Route path="/vendor-list"  element={<Protected><VendorList /></Protected>} />
                        <Route path="/rate-vendors" element={<Protected><RateVendors /></Protected>} />
                        <Route path="/edit-vendor/:vendorId" element={<Protected><EditVendor isAdmin={isAdmin} /></Protected>} />
                        <Route path="/add-vendor"   element={<Protected><AddVendor /></Protected>} />

                        {/* bilinmeyen rota */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </main>

                {/* ✅ Global footer */}
                <Footer />
            </div>
        </Router>
    );
}

export default App;
