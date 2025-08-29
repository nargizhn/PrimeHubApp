import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import VendorList from "./components/VendorList";
import RateVendors from "./components/RateVendors";
import LoginSignup from "./components/LoginSignup";

function App() {
  const [user, setUser] = useState(null); 

  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginSignup setUser={setUser} isLogin={true} />} />
        <Route path="/signup" element={<LoginSignup setUser={setUser} isLogin={false} />} />
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <LoginSignup setUser={setUser} />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard setUser={setUser} /> : <Navigate to="/" />}
        />

        <Route
          path="/profile"
          element={user ? <Profile /> : <Navigate to="/" />}
        />
        <Route
          path="/vendor-list"
          element={user ? <VendorList /> : <Navigate to="/" />}
        />
        <Route
          path="/rate-vendors"
          element={user ? <RateVendors /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
