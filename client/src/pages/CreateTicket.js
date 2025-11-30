// src/pages/CreateTicket.js
import React, { useState } from "react";
import contractUtils from "../utils/contract";  // <-- NEW: ethers contract
import { uploadToPinata } from "../utils/ipfsUpload";

export default function CreateTicket() {
  const [equipmentType, setEquipmentType] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [commonIssue, setCommonIssue] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [remedialAction, setRemedialAction] = useState("");
  const [loading, setLoading] = useState(false);

  const commonIssueList = [
    "Computer not powering on",
    "Blue screen crash",
    "Slow performance",
    "Network connectivity issue",
    "Virus or malware infection",
    "Printer not working",
    "Software installation issue",
    "Other",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!window.ethereum) {
      alert("Please install MetaMask to submit a ticket.");
      return;
    }

    if (!equipmentType || !serialNumber || !commonIssue || !issueDescription) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      // ---- Build ticket JSON ----
      const ticketData = {
        equipmentType,
        serialNumber,
        commonIssue,
        issueDescription,
        remedialAction,
        createdAt: new Date().toISOString(),
      };

      console.log("Uploading JSON to IPFS...", ticketData);
      const cid = await uploadToPinata(ticketData);
      console.log("IPFS CID received:", cid);

      // ---- Load write-enabled contract ----
      const contract = await contractUtils.getWriteContract();

      // ---- Submit transaction ----
      console.log("Sending transaction to blockchain...");
      const tx = await contract.createTicket(cid);
      await tx.wait();

      alert("Ticket submitted successfully!");

      // Clear form
      setEquipmentType("");
      setSerialNumber("");
      setCommonIssue("");
      setIssueDescription("");
      setRemedialAction("");

    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      alert("Error submitting ticket. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h2>Create New Ticket</h2>

      <form onSubmit={handleSubmit}>
        <label>Equipment Type *</label>
        <select
          value={equipmentType}
          onChange={(e) => setEquipmentType(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        >
          <option value="">Select equipment</option>
          <option value="Laptop">Laptop</option>
          <option value="Desktop">Desktop</option>
          <option value="Printer">Printer</option>
          <option value="Tablet">Tablet</option>
          <option value="Server">Server</option>
          <option value="Networking Device">Networking Device</option>
        </select>

        <label>Serial Number *</label>
        <input
          type="text"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
          placeholder="Enter equipment serial number"
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <label>Common Issue *</label>
        <select
          value={commonIssue}
          onChange={(e) => setCommonIssue(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        >
          <option value="">Select issue</option>
          {commonIssueList.map((issue, idx) => (
            <option key={idx} value={issue}>
              {issue}
            </option>
          ))}
        </select>

        <label>Detailed Issue Description *</label>
        <textarea
          rows={4}
          value={issueDescription}
          onChange={(e) => setIssueDescription(e.target.value)}
          placeholder="Describe the problem..."
          style={{ width: "100%", padding: "10px", marginBottom: "15px" }}
        />

        <label>Remedial Action Taken</label>
        <textarea
          rows={3}
          value={remedialAction}
          onChange={(e) => setRemedialAction(e.target.value)}
          placeholder="Optional: What troubleshooting steps were tried?"
          style={{ width: "100%", padding: "10px", marginBottom: "20px" }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px 24px",
            fontSize: "18px",
            cursor: "pointer",
            width: "100%",
          }}
        >
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
}
