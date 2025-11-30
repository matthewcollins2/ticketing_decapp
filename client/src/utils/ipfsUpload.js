// src/utils/ipfsUpload.js

export async function uploadToPinata(jsonBody) {
  console.log("Sending JSON to backend for Pinata upload…", jsonBody);

  const res = await fetch("http://localhost:5000/api/ipfs/uploadJson", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(jsonBody),
  });

  if (!res.ok) {
    const t = await res.text();
    console.error("Backend IPFS error:", res.status, t);
    throw new Error(`Backend IPFS upload failed: ${res.status}`);
  }

  const data = await res.json();
  console.log("Backend Pinata response:", data);

  return data.IpfsHash; // CID
}
