// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import "./Navbar.css"; // optional, or style inline

export default function Navbar() {
  const { address, network, connectWallet, disconnectWallet, connecting } =
    useWallet();

  const shortAddr = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not connected";

  const netLabel = network
    ? `${network.name || "Custom"} (chainId: ${network.chainId})`
    : "No network";

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 20px",
        backgroundColor: "#0d1117",
        color: "#fff",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
          BlockDesk
        </span>
        <Link to="/" style={{ color: "#fff", textDecoration: "none" }}>
          Dashboard
        </Link>
        <Link to="/create" style={{ color: "#fff", textDecoration: "none" }}>
          Create Ticket
        </Link>
        <Link to="/admin" style={{ color: "#fff", textDecoration: "none" }}>
          Admin
        </Link>
        <Link to="/assign" style={{ color: "#fff", textDecoration: "none" }}>
          Assign Ticket
        </Link>
      </div>

      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: "0.85rem" }}>{netLabel}</div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "0.9rem" }}>{shortAddr}</span>
          {address ? (
            <button
              onClick={disconnectWallet}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid #555",
                background: "#161b22",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectWallet}
              disabled={connecting}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "none",
                background: "#238636",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
