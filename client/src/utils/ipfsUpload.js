const PINATA_JWT = process.env.REACT_APP_PINATA_JWT;
const GATEWAY = process.env.REACT_APP_GATEWAY;

export async function uploadJsonToIPFS(json) {
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify(json),
  });

  if (!res.ok) throw new Error("JSON upload failed");

  const data = await res.json();

  return {
    cid: data.IpfsHash,         
    url: `${GATEWAY}${data.IpfsHash}`
  };
}

export async function uploadFileToIPFS(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("File upload failed");

  const data = await res.json();

  return {
    cid: data.IpfsHash,
    url: `${GATEWAY}${data.IpfsHash}`
  };
}

