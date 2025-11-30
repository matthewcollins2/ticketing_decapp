import React, { useEffect, useState } from "react";
import axios from "axios";
import { useWallet } from "../context/WalletContext";

export default function AssignTicket() {
  const { contract, address } = useWallet();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [agentAddress, setAgentAddress] = useState("");

  const loadTickets = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const count = await contract.ticketCount();
      const total = Number(count);
      const rows = [];

      for (let i = 1; i <= total; i++) {
        const t = await contract.getTicket(i);
        const cid = t.ipfsHash;

        const { data } = await axios.get(
          `https://gateway.pinata.cloud/ipfs/${cid}`
        );

        rows.push({
          id: Number(t.id),
          creator: t.creator,
          assignedTo: t.assignedTo,
          status: Number(t.status),
          metadata: data,
        });
      }

      setTickets(rows);
    } catch (err) {
      console.error("Assign load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [contract]);

  const handleAssign = async (ticketId) => {
    if (!contract || !address) {
      alert("Connect wallet first");
      return;
    }

    if (!agentAddress) {
      alert("Enter an agent address");
      return;
    }

    try {
      const tx = await contract.assignTicket(ticketId, agentAddress);
      await tx.wait();
      setAgentAddress("");
      loadTickets();
    } catch (err) {
      console.error("Assign error:", err);
      alert("Failed to assign ticket. Check console.");
    }
  };

  return (
    <div>
      <h2>Assign Tickets</h2>

      <div style={{ marginBottom: "12px" }}>
        <label>Agent Address:</label>
        <input
          type="text"
          value={agentAddress}
          onChange={(e) => setAgentAddress(e.target.value)}
          style={{ width: "350px", marginLeft: "10px" }}
        />
      </div>

      {loading && <p>Loading tickets…</p>}

      {!loading &&
        tickets.map((t) => (
          <div key={t.id} style={{ border: "1px solid #ddd", borderRadius: "8px", padding: "12px", marginBottom: "10px" }}>
            <strong>Ticket #{t.id}</strong> <br />
            <strong>{t.metadata.equipmentType}</strong> — SN: {t.metadata.serialNumber} <br />
            Assigned To: {t.assignedTo === "0x0000000000000000000000000000000000000000" ? "Unassigned" : t.assignedTo}
            <br />
            <button onClick={() => handleAssign(t.id)}>Assign to Agent</button>
          </div>
        ))}
    </div>
  );
}
