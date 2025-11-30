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

// ⭐ Your real deployed contract address (CHECKSUM SAFE)
const CONTRACT_ADDRESS = "0xfEe7dE0522EC84c1DB0620065Ea205831DcE26A3";

// ⭐ Local network override (stops ENS lookups)
const LOCAL_NETWORK = {
  chainId: 1337,
  name: "local",
};

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
  };

  /**
   * Connect wallet (Stable function for useEffect)
   */
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskAvailable) {
      alert("MetaMask not detected. Please install the extension.");
      return;
    }

    try {
      setConnecting(true);

      // ⭐ Correct provider creation with network override
      const browserProvider = new BrowserProvider(
        window.ethereum,
        LOCAL_NETWORK
      );

      await browserProvider.send("eth_requestAccounts", []);

      const s = await browserProvider.getSigner();
      const addr = await s.getAddress();
      const net = LOCAL_NETWORK; // force local network label

      // Attach the smart contract
      const c = new Contract(CONTRACT_ADDRESS, Ticketing.abi, s);

      setProvider(browserProvider);
      setSigner(s);
      setAddress(addr);
      setNetwork(net);
      setContract(c);
    } catch (err) {
      console.error("connectWallet error:", err);
      resetState();
    } finally {
      setConnecting(false);
    }
  }, [isMetaMaskAvailable]);

  const disconnectWallet = () => resetState();

  /**
   * Auto-reconnect on refresh
   */
  useEffect(() => {
    if (!isMetaMaskAvailable) return;

    const browserProvider = new BrowserProvider(window.ethereum, LOCAL_NETWORK);

    browserProvider
      .listAccounts()
      .then(async (accounts) => {
        if (accounts.length === 0) return;
        await connectWallet();
      })
      .catch((err) => console.warn("Auto-connect failed:", err));

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
