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

function App() {
  const { user, checking } = useAuth();
  const isAdmin = true;

  if (checking) {
    return <div style={{textAlign:'center',marginTop:60,fontSize:22}}>Loading...</div>;
  }

  return (
    <Router basename={process.env.PUBLIC_URL}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginSignup />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <LoginSignup isLogin={false} />} />
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginSignup />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" replace />}
        />
        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/" replace />}
        />
        <Route
          path="/vendor-list"
          element={user ? <VendorList /> : <Navigate to="/" replace />}
        />
        <Route
          path="/rate-vendors"
          element={user ? <RateVendors /> : <Navigate to="/" replace />}
        />
        <Route 
          path="/edit-vendor/:vendorId" 
          element={<EditVendor isAdmin={isAdmin} />} 
        />
        <Route 
          path="/add-vendor" 
          element={<AddVendor />} />
        {/* Catch-all route for non-existent paths */}
        <Route 
          path="*" 
          element={<Navigate to="/" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
