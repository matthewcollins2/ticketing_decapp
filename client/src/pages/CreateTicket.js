// src/pages/CreateTicket.js
import React, { useState } from "react";
import contractUtils from "../utils/contract";
import { uploadFileToIPFS, uploadJsonToIPFS } from "../utils/ipfsUpload";

export default function CreateTicket() {
  const [title, setTitle] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [commonIssue, setCommonIssue] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [remedialAction, setRemedialAction] = useState("");
  const [files, setFiles] = useState([]);
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
      alert("Please install MetaMask.");
      return;
    }
    if (!title || !equipmentType || !serialNumber || !commonIssue || !issueDescription) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);

      let uploadedFiles = [];
      for (let file of files) {
        const result = await uploadFileToIPFS(file);
        uploadedFiles.push({
          fileName: file.name,
          cid: result.cid,
          url: result.url,
        });
      }

      const metadata = {
        title,
        equipmentType,
        serialNumber,
        commonIssue,
        issueDescription,
        remedialAction,
        files: uploadedFiles,
        createdAt: new Date().toISOString(),
      };

      const { cid: metadataCID } = await uploadJsonToIPFS(metadata);

      const contract = await contractUtils.getWriteContract();
      const tx = await contract.createTicket(metadataCID);
      await tx.wait();

      alert("Ticket submitted successfully!");

      setTitle("");
      setEquipmentType("");
      setSerialNumber("");
      setCommonIssue("");
      setIssueDescription("");
      setRemedialAction("");
      setFiles([]);

    } catch (err) {
      console.error("SUBMIT ERROR:", err);
      alert("Error submitting ticket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "650px", margin: "0 auto", paddingBottom: "40px" }}>
      <h2 style={{ marginBottom: "20px" }}>Create New Ticket</h2>

      <form onSubmit={handleSubmit}>
        <label>Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short summary of the issue"
          style={inputStyle}
        />

        <label>Equipment Type *</label>
        <select
          value={equipmentType}
          onChange={(e) => setEquipmentType(e.target.value)}
          style={inputStyle}
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
          placeholder="Enter serial number"
          style={inputStyle}
        />

        <label>Common Issue *</label>
        <select
          value={commonIssue}
          onChange={(e) => setCommonIssue(e.target.value)}
          style={inputStyle}
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
          placeholder="Describe the problem…"
          style={textAreaStyle}
        />

        <label>Remedial Action Taken</label>
        <textarea
          rows={3}
          value={remedialAction}
          onChange={(e) => setRemedialAction(e.target.value)}
          placeholder="Optional details…"
          style={textAreaStyle}
        />

        <label>Attach Files</label>
        <input
          type="file"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files))}
          style={inputStyle}
        />

        <button type="submit" disabled={loading} style={submitButtonStyle}>
          {loading ? "Submitting…" : "Submit Ticket"}
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "15px",
  border: "1px solid #ccc",
  borderRadius: "6px",
  fontSize: "16px",
  boxSizing: "border-box",
};

const textAreaStyle = {
  ...inputStyle,
  height: "120px",
  resize: "vertical",
};

const submitButtonStyle = {
  padding: "14px 20px",
  width: "100%",
  backgroundColor: "#0d6efd",
  color: "white",
  fontSize: "18px",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginTop: "10px",
};
