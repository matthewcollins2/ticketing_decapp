// src/context/WalletContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { BrowserProvider, Contract } from "ethers";
import Ticketing from "../abi/Ticketing.json";

function getDeployedAddress() {
  const networks = Ticketing.networks;
  const chainId = 1337;
  if (!networks || !networks[chainId]) {
    throw new Error("Contract not deployed on chain " + chainId);
  }
  return networks[chainId].address;
}

const CONTRACT_ADDRESS = getDeployedAddress();
const LOCAL_NETWORK = { chainId: 1337, name: "local" };
const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const [address, setAddress] = useState(null);
  const [network, setNetwork] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const isMetaMaskAvailable =
    typeof window !== "undefined" && window.ethereum;

  const resetState = () => {
    setAddress(null);
    setNetwork(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    localStorage.removeItem("connected");
  };

  const connectWallet = useCallback(async () => {
    if (!isMetaMaskAvailable) {
      alert("MetaMask not detected.");
      return;
    }

    try {
      setConnecting(true);
      const browserProvider = new BrowserProvider(
        window.ethereum,
        LOCAL_NETWORK
      );

      await browserProvider.send("eth_requestAccounts", []);

      const s = await browserProvider.getSigner();
      const addr = await s.getAddress();

      const c = new Contract(CONTRACT_ADDRESS, Ticketing.abi, s);

      setProvider(browserProvider);
      setSigner(s);
      setAddress(addr);
      setNetwork(LOCAL_NETWORK);
      setContract(c);

      localStorage.setItem("connected", "true");
    } catch (err) {
      console.error("connectWallet error:", err);
      resetState();
    } finally {
      setConnecting(false);
    }
  }, [isMetaMaskAvailable]);

  const disconnectWallet = async () => {
    resetState();
    localStorage.removeItem("connected");

    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
    } catch (_) {}
  };

  useEffect(() => {
    if (!isMetaMaskAvailable) return;

    const browserProvider = new BrowserProvider(window.ethereum, LOCAL_NETWORK);

    browserProvider
      .listAccounts()
      .then(async (accounts) => {
        if (accounts.length === 0) return;
        if (localStorage.getItem("connected")) {
          await connectWallet();
        }
      })
      .catch(() => {});

    const handleAccountsChanged = () => connectWallet();
    const handleChainChanged = () => window.location.reload();

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      if (!window.ethereum) return;
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [connectWallet, isMetaMaskAvailable]);

  const value = {
    address,
    network,
    provider,
    signer,
    contract,
    connecting,
    connectWallet,
    disconnectWallet,
    isMetaMaskAvailable,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
export { WalletContext };
