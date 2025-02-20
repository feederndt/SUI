import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Signer } from "@mysten/sui/cryptography";

// use getFullnodeUrl to define the Devnet RPC location
const rpcUrl = getFullnodeUrl("mainnet");

// create a client connected to devnet
const client = new SuiClient({ url: rpcUrl });

const PRIVATE_KEY =
  "suiprivkey1qz69qpql7l2khrrw6jvsvhr82pyx89gtzl5lrdyvvplrfw203dl8jtv7juw";

// Replace with the recipient's Sui address
const RECIPIENT_ADDRESS =
  "0x72636c6bfbe3a2b3ae487802fcd4ba548bc63065eb04adaa08cdea97e76d568b";

const suiTransaction = new Transaction();

const signer = new Signer();

const amount = 0.01 * 10 ** 9; // Amount in Mist (1 SUI = 1,000,000 Mist)

// Split the gas coin to create a new coin with the specified amount
const [coin] = tx.splitCoins(tx.gas, [amount]);

// Transfer the new coin to the recipient
tx.transferObjects([coin], recipient);

async function getOwnedCoins() {
  const coins = await client.getCoins({
    owner: "0x918780f76becee940c8b997048b480984e46343373c3093da9f5f6bfea29d7e4",
  });
  console.log(Number(coins.data[0].balance) / 10 ** 9);
}

getOwnedCoins();
