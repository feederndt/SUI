import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import XLSX from "xlsx";

const addresses = [];
const privatekeys = [];

const createWallet = () => {
  for (let i = 0; i < 10000; i++) {
    const keypair = Ed25519Keypair.generate();

    const privateKey = keypair.getSecretKey();

    const suiAddress = keypair.getPublicKey().toSuiAddress();

    addresses.push(suiAddress);
    privatekeys.push(privateKey);
  }
};

createWallet();

const data = addresses.map((_, i) => [addresses[i], privatekeys[i]]);

// Create workbook and worksheet
const ws = XLSX.utils.aoa_to_sheet(data);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

// Write the file
XLSX.writeFile(wb, "HaedalOKXCauHa.xlsx");
