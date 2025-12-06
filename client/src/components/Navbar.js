// src/components/Navbar.js
import React from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import "./Navbar.css";

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
    <nav className="navbar">
      {/* LEFT: Logo */}
      <div className="nav-logo">BlockDesk</div>

      {/* CENTER: Navigation Links */}
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/create">Create Ticket</Link>
        <Link to="/admin">Admin</Link>
        <Link to="/assign">Assign Ticket</Link>
      </div>

      {/* RIGHT: Wallet + Network */}
      <div className="nav-right">
        <span className="nav-network">{netLabel}</span>

        <div className="nav-wallet">
          <span>{shortAddr}</span>

          {address ? (
            <button className="btn-disconnect" onClick={disconnectWallet}>
              Disconnect
            </button>
          ) : (
            <button
              className="btn-connect"
              onClick={connectWallet}
              disabled={connecting}
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
