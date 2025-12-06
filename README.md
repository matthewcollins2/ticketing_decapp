# ticketing_decapp
# ticketing_decapp — BlockDesk Decentralized Ticketing DApp

A decentralized IT-support ticketing system built with Ethereum (smart contract), IPFS (for metadata & attachments), and a React front-end.

---

## Tech Stack

- Ethereum smart contract (Solidity)  
- Local blockchain via Ganache (networkId 1337)  
- Deployment & migrations via Truffle  
- Frontend with React, using ethers.js for blockchain interactions  
- Metadata & file storage on IPFS (via Pinata)  

---

## Prerequisites

Make sure you have installed:

- Node.js (v16 or newer recommended)  
- Ganache (CLI or GUI)  
- Truffle globally (`npm install -g truffle`)  
- A Pinata account and JWT for IPFS uploads  
- MetaMask extension (for interacting with the DApp)  

---

## 🔧 Setup & Run (Local Development)

1. **Clone the repository**  
   ```bash
   git clone https://github.com/matthewcollins2/ticketing_decapp.git
   cd ticketing_decapp

2. **Install Dependencies**
    ```bash
    npm install
    npm install -g ganache
    npm install -g truffle

3. **Install Metamask**
    Install Metamask extension

4. **Pinata IPFS**
    Create a free account at
    <https://app.pinata.cloud> 

    Update .env file located in client subfolder.

5. **Run Scripts**
```
    "scripts": {
  "ganache": "ganache --networkId 1337 --chain.chainId 1337 --mnemonic \"candy maple cake sugar pudding cream honey rich smooth crumble sweet treat\" --port 7545",
  "migrate": "sleep 3 && truffle migrate --reset",
  "client": "cd client && npm start",
  "dev-all": "npm-run-all -p ganache migrate client"
    }
```     
**from bash terminal at root folder run-> npm run dev-all