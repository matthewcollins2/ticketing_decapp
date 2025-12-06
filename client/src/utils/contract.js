import { BrowserProvider, Contract } from "ethers";
import Ticketing from "../abi/Ticketing.json";

function getDeployedAddress() {
  const networks = Ticketing.networks;
  const chainId = 1337;

  if (!networks || !networks[chainId]) {
    throw new Error(`Contract not deployed on chain ${chainId}`);
  }

  return networks[chainId].address;
}

const CONTRACT_ADDRESS = getDeployedAddress();

const LOCAL_NETWORK = { chainId: 1337, name: "local" };

export async function getProvider() {
  return new BrowserProvider(window.ethereum, LOCAL_NETWORK);
}

export async function getSigner() {
  const provider = await getProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}

export async function getReadContract() {
  const provider = await getProvider();
  return new Contract(CONTRACT_ADDRESS, Ticketing.abi, provider);
}

export async function getWriteContract() {
  const signer = await getSigner();
  return new Contract(CONTRACT_ADDRESS, Ticketing.abi, signer);
}

export default {
  getProvider,
  getSigner,
  getReadContract,
  getWriteContract,
};
