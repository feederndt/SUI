import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";

const PRIVATE_KEY =
  "suiprivkey1qz69qpql7l2khrrw6jvsvhr82pyx89gtzl5lrdyvvplrfw203dl8jtv7juw";

const RECIPIENT_ADDRESS =
  "0x72636c6bfbe3a2b3ae487802fcd4ba548bc63065eb04adaa08cdea97e76d568b";

const AMOUNT = 0.01;

const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

const keypair = Ed25519Keypair.fromSecretKey(PRIVATE_KEY);

console.log(MIST_PER_SUI);

async function sendSui() {
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [100000000]);
  tx.transferObjects([coin], RECIPIENT_ADDRESS);
  tx.setGasBudget(0.01 * 10 ** 9);

  const result = await client.signAndExecuteTransaction({
    signer: keypair,
    transaction: tx,
  });

  return result;
}

sendSui()
  .then((result) => {
    console.log("Transaction Digest:", result.digest);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
