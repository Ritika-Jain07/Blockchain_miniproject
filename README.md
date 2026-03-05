# Blockchain-Enabled Secure Access Control and Audit Logging for EHR Systems

## Features
- Role-based + purpose-based access control (Doctor/Researcher)
- Consent-based research sharing
- SHA-256 record hashing; hashes stored on-chain (1788 records)
- Immutable blockchain audit logs for every access attempt
- Express backend + simple dashboard UI

## Tech
Solidity, Truffle, Ganache, Node.js, Express, Web3.js

## Run (local)
1) Ganache on 7545
2) `npx truffle migrate --reset --network development`
3) `cd backend && npm start` (UI at http://127.0.0.1:5050)
