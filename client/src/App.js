// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import CreateTicket from "./pages/CreateTicket";
import AdminDashboard from "./pages/AdminDashboard";
import AssignTicket from "./pages/AssignTicket";
import "./index.css";

function App() {
  return (
    <div>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateTicket />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/assign" element={<AssignTicket />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
