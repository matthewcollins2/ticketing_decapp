// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import contractUtils from "../utils/contract";

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState(null);

  // Connect wallet on load
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setWallet(accounts[0]);
  };

  // Load all tickets from contract
  const loadTickets = async () => {
    try {
      setLoading(true);

      const contract = await contractUtils.getReadContract();
      const ticketCount = Number(await contract.ticketCount());

      const items = [];

      for (let i = 1; i <= ticketCount; i++) {
        const t = await contract.getTicket(i);

        // Fetch JSON from IPFS based on CID
        let details = null;
        try {
          const url = `https://gateway.pinata.cloud/ipfs/${t.ipfsHash}`;
          const res = await fetch(url);
          if (res.ok) details = await res.json();
        } catch (err) {
          console.error("Failed to load IPFS JSON:", err);
        }

        items.push({
          id: Number(t.id),
          creator: t.creator,
          assignedTo: t.assignedTo,
          status: t.status, // enum number
          ipfsHash: t.ipfsHash,
          details,
        });
      }

      setTickets(items);
    } catch (err) {
      console.error("LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    connectWallet();
    loadTickets();
  }, []);

  const statusText = (status) => {
    switch (Number(status)) {
      case 0: return "OPEN";
      case 1: return "ASSIGNED";
      case 2: return "IN_PROGRESS";
      case 3: return "CLOSED";
      default: return "UNKNOWN";
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      {!wallet && (
        <button onClick={connectWallet} style={{ padding: "10px 20px" }}>
          Connect Wallet
        </button>
      )}

      <button onClick={loadTickets} style={{ padding: "10px 20px", marginLeft: "10px" }}>
        Refresh
      </button>

      {loading && <p>Loading tickets...</p>}

      {!loading && tickets.length === 0 && (
        <p>No tickets found. Create one!</p>
      )}

      <div style={{ marginTop: "20px" }}>
        {tickets.map((t) => (
          <div
            key={t.id}
            style={{
              padding: "15px",
              marginBottom: "15px",
              border: "1px solid #ccc",
              borderRadius: "8px",
            }}
          >
            <h3>Ticket #{t.id}</h3>
            <p><strong>Status:</strong> {statusText(t.status)}</p>
            <p><strong>Creator:</strong> {t.creator}</p>
            <p><strong>Assigned To:</strong> {t.assignedTo === "0x0000000000000000000000000000000000000000" ? "None" : t.assignedTo}</p>
            <p><strong>IPFS CID:</strong> <a href={`https://gateway.pinata.cloud/ipfs/${t.ipfsHash}`} target="_blank" rel="noreferrer">{t.ipfsHash}</a></p>

            {t.details && (
              <div style={{ marginTop: "10px" }}>
                <h4>Details From IPFS</h4>
                <p><strong>Equipment:</strong> {t.details.equipmentType}</p>
                <p><strong>Serial Number:</strong> {t.details.serialNumber}</p>
                <p><strong>Issue:</strong> {t.details.commonIssue}</p>
                <p><strong>Description:</strong> {t.details.issueDescription}</p>
                <p><strong>Remedial Action:</strong> {t.details.remedialAction || "None"}</p>
                <p><strong>Created At:</strong> {new Date(t.details.createdAt).toLocaleString()}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
