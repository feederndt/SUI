import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import fs from "fs"

const address_datas = fs.readFileSync('walletAddress.txt', 'utf8');

const private_datas = fs.readFileSync('privateKey.txt', 'utf8');


const walletArr = address_datas.split(/\r?\n|\r|\n/g).filter(e => e.length > 0)

const privateArr = private_datas.split(/\r?\n|\r|\n/g).filter(e => e.length > 0)

const GAS_BUDGET = 2000000

const client = new SuiClient({ url: getFullnodeUrl("mainnet") });


async function sendSui() {

  if (walletArr.length != privateArr.length || walletArr.length == 0 || privateArr.length == 0) {
    console.log("Dlm nhìn lại")
  } else {
    for (let i = 0; i < walletArr.length; i++) {
      const keypair = Ed25519Keypair.fromSecretKey(privateArr[i]);

      const senderAddress = keypair.getPublicKey().toSuiAddress()

      const sui = await client.getBalance({
        owner: senderAddress,
      });

      const suiBalance = Number(sui.totalBalance)

      console.log(suiBalance)

      const numTrans = suiBalance - GAS_BUDGET
      if (numTrans > 0) {
        const tx = new Transaction();
        const [coin] = tx.splitCoins(tx.gas, [numTrans]);
        tx.transferObjects([coin], walletArr[i]);
        tx.setGasBudget(GAS_BUDGET);

        const result = await client.signAndExecuteTransaction({
          signer: keypair,
          transaction: tx,
        })
      }

    }
  }
}

sendSui()

