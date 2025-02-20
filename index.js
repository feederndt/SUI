import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import fs from "fs"

const address_datas = fs.readFileSync('walletAddress.txt', 'utf8');

const private_datas = fs.readFileSync('privateKey.txt', 'utf8');


const walletArr = address_datas.split(/\r?\n|\r|\n/g).filter(e => e.length > 0)

const privateArr = private_datas.split(/\r?\n|\r|\n/g).filter(e => e.length > 0)

const GAS_BUDGET = 1500000

const client = new SuiClient({ url: getFullnodeUrl("mainnet") });


async function sendSui() {

  if (walletArr.length != privateArr.length || walletArr.length == 0 || privateArr.length) {
    console.log("Dlm nhìn lại")
  } else {
    for (let i = 0; i < walletArr.length; i++) {
      const keypair = Ed25519Keypair.fromSecretKey(privateArr[i]);

      const senderAddress = keypair.getPublicKey().toSuiAddress()

      const coins = await client.getCoins({
        owner: senderAddress,
      });

      const suiBalance = Number(coins.data[0].balance)
      const numTrans = suiBalance - GAS_BUDGET

      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [numTrans]);
      tx.transferObjects([coin], walletArr[i]);
      tx.setGasBudget(GAS_BUDGET);

      const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
      })

      result.then((result) => {
        console.log("Transaction Digest:", result.digest);
      })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }
}

sendSui()

