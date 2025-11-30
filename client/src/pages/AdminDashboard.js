// src/pages/AdminDashboard.js
import React, { useEffect, useState } from "react";
import contractUtils from "../utils/contract";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);

  // Connect wallet on page load
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to manage tickets.");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setWallet(accounts[0]);
  };

  // Load all tickets (contract + IPFS)
  const loadTickets = async () => {
    try {
      setLoading(true);
      const contract = await contractUtils.getReadContract();

      const count = Number(await contract.ticketCount());
      const rows = [];

      for (let i = 1; i <= count; i++) {
        const t = await contract.getTicket(i);

        // Fetch metadata from IPFS
        let metadata = null;
        try {
          const url = `https://gateway.pinata.cloud/ipfs/${t.ipfsHash}`;
          const res = await fetch(url);
          if (res.ok) metadata = await res.json();
        } catch (err) {
          console.error("IPFS load error:", err);
        }

        rows.push({
          id: Number(t.id),
          creator: t.creator,
          assignedTo: t.assignedTo,
          status: Number(t.status),
          ipfsHash: t.ipfsHash,
          metadata,
        });
      }

      setTickets(rows);
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    connectWallet();
    loadTickets();
  }, []);

  const statusNames = ["OPEN", "ASSIGNED", "IN_PROGRESS", "CLOSED"];

  // Write: update the ticket status
  const updateStatus = async (ticketId, newStatus) => {
    if (!wallet) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      const contract = await contractUtils.getWriteContract();
      const tx = await contract.updateStatus(ticketId, newStatus);
      await tx.wait();

      alert(`Status updated for Ticket #${ticketId}`);
      loadTickets();
    } catch (err) {
      console.error("Status update error:", err);
      alert("Failed to update status.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      {!wallet && (
        <button
          onClick={connectWallet}
          style={{ padding: "10px 20px", marginBottom: "10px" }}
        >
          Connect Wallet
        </button>
      )}

      {loading && <p>Loading tickets…</p>}

      {!loading && tickets.length === 0 && <p>No tickets found.</p>}

      {!loading &&
        tickets.length > 0 &&
        tickets.map((t) => (
          <div
            key={t.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "12px",
            }}
          >
            <h3>
              Ticket #{t.id} — <span style={{ color: "blue" }}>{statusNames[t.status]}</span>
            </h3>

            <p><strong>Creator:</strong> {t.creator}</p>
            <p>
              <strong>Assigned To:</strong>{" "}
              {t.assignedTo === "0x0000000000000000000000000000000000000000"
                ? "Unassigned"
                : t.assignedTo}
            </p>

            {t.metadata && (
              <div style={{ marginTop: "10px" }}>
                <p>
                  <strong>Equipment:</strong> {t.metadata.equipmentType}  
                  {" — "} SN: {t.metadata.serialNumber}
                </p>
                <p><strong>Issue:</strong> {t.metadata.commonIssue}</p>
                <p><strong>Description:</strong> {t.metadata.issueDescription}</p>
                <p><strong>Remedial Action:</strong> {t.metadata.remedialAction || "None"}</p>
              </div>
            )}

            <div style={{ marginTop: "15px" }}>
              <button
                onClick={() => updateStatus(t.id, 2)}
                style={{ marginRight: "10px", padding: "8px 16px" }}
              >
                Start Work
              </button>

              <button
                onClick={() => updateStatus(t.id, 3)}
                style={{ padding: "8px 16px" }}
              >
                Close Ticket
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
