// src/utils/contract.js
import { BrowserProvider, Contract } from "ethers";
import Ticketing from "../abi/Ticketing.json";

// Your deployed contract address
const CONTRACT_ADDRESS = "0xfEe7dE0522EC84c1DB0620065Ea205831DcE26A3";

// Local network override (prevents ENS lookup errors)
const LOCAL_NETWORK = {
  chainId: 1337,
  name: "local",
};

/**
 * Create provider and override network at construction time
 */
export async function getProvider() {
  return new BrowserProvider(window.ethereum, LOCAL_NETWORK);
}

/**
 * Get signer for write operations
 */
export async function getSigner() {
  const provider = await getProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}

/**
 * Read-only contract instance
 */
export async function getReadContract() {
  const provider = await getProvider();
  return new Contract(CONTRACT_ADDRESS, Ticketing.abi, provider);
}

/**
 * Write-enabled contract instance
 */
export async function getWriteContract() {
  const signer = await getSigner();
  return new Contract(CONTRACT_ADDRESS, Ticketing.abi, signer);
}

const contractUtils = {
  getProvider,
  getSigner,
  getReadContract,
  getWriteContract,
};

export default contractUtils;
