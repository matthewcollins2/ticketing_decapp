// src/pages/AssignTickets.js
import React, { useEffect, useState } from "react";
import contractUtils from "../utils/contract";

export default function AssignTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load tickets
  const loadTickets = async () => {
    try {
      setLoading(true);

      const contract = await contractUtils.getReadContract();
      const count = Number(await contract.ticketCount());

      const rows = [];

      for (let i = 1; i <= count; i++) {
        const t = await contract.getTicket(i);
        console.log("Ticket:", t.id, "Status raw:", t.status);


        if (t.status === 3n) continue;

        let metadata = null;
        try {
          const url = `https://gateway.pinata.cloud/ipfs/${t.ipfsHash}`;
          const res = await fetch(url);
          if (res.ok) metadata = await res.json();
        } catch (err) {
          console.error("IPFS metadata load error:", err);
        }

        rows.push({
          id: Number(t.id),
          assignedTo: t.assignedTo,
          ipfsHash: t.ipfsHash,
            metadata,
        });
      }

      setTickets(rows);
    } catch (err) {
      console.error("Ticket load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // 🔥 Assign ticket by opening MetaMask account selector
  const assignTicket = async (ticketId) => {
    try {
      // This line ALWAYS opens MetaMask account selector if multiple accounts exist
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const selectedAgent = accounts[0];
      console.log("User selected agent:", selectedAgent);

      const contract = await contractUtils.getWriteContract();
      const tx = await contract.assignTicket(ticketId, selectedAgent);
      await tx.wait();

      alert(`Ticket #${ticketId} assigned to ${selectedAgent}`);
      loadTickets();
    } catch (err) {
      console.error("Assign error:", err);
      alert("Failed to assign ticket.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Assign Tickets</h2>

      {loading && <p>Loading...</p>}
      {!loading && tickets.length === 0 && <p>No open tickets found.</p>}

      {tickets.map((t) => (
        <div
          key={t.id}
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            padding: "18px",
            borderRadius: "8px",
            marginBottom: "16px",
            maxWidth: "650px",
          }}
        >
          <h3>Ticket #{t.id}</h3>

          {t.metadata && (
            <>
              <p>
                <strong>Equipment:</strong> {t.metadata.equipmentType}
              </p>
              <p>
                <strong>Serial Number:</strong> {t.metadata.serialNumber}
              </p>
              <p>
                <strong>Issue:</strong> {t.metadata.commonIssue}
              </p>
              <p>
                <strong>Description:</strong> {t.metadata.issueDescription}
              </p>
            </>
          )}

          <p>
            <strong>Assigned To:</strong>{" "}
            {t.assignedTo ===
            "0x0000000000000000000000000000000000000000"
              ? "Unassigned"
              : t.assignedTo}
          </p>

          <button
            onClick={() => assignTicket(t.id)}
            style={{
              padding: "10px 20px",
              marginTop: "12px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            Assign Ticket
          </button>
        </div>
      ))}
    </div>
  );
}

