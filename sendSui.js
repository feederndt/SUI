//npm init
//npm install @mysten/sui.js bignumber.js readline-sync chalk fs xlsx
//package.json "type": "module"
import { getFullnodeUrl, SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import BigNumber from 'bignumber.js';
import fs from 'fs';
import readlineSync from 'readline-sync';
import chalk from 'chalk';


const secret_key_mnemonics = fs.readFileSync('mnemonic_sendSui.txt', 'utf-8').trim();
const addresses = fs.readFileSync('address.txt', 'utf-8').split('\n').map(addr => addr.trim()).filter(Boolean);
const amountToSendCleaned = 0.1;


function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}
const client = new SuiClient({
    url: getFullnodeUrl('mainnet'),
});

function calculateBalance(totalBalance, divider) {
    return Number(totalBalance) / Math.pow(10, divider);
}

function reverseCalculateBalance(balance, multiplier) {
    return balance * Math.pow(10, multiplier);
}

const parseAmount = (amount, coinDecimals) => new BigNumber(amount).shiftedBy(coinDecimals).integerValue();

const checkCanSend = async (suiAddress, amount, transactionBuilder) => {
    const totalBalance = await client.getBalance({
        owner: suiAddress,
        coinType: "0x2::sui::SUI"
    });

    if (new BigNumber(totalBalance.totalBalance).gte(amount)) {
        const splitAmount = transactionBuilder.pure(amount.toString());
        const [splitCoin] = transactionBuilder.splitCoins(transactionBuilder.gas, [splitAmount]);
        return splitCoin;
    }
    return null;
};

const sendTransaction = (client, bytes, signature) => new Promise(async (resolve, reject) => {
    try {
        await client.dryRunTransactionBlock({
            transactionBlock: bytes
        });
        const result = await client.executeTransactionBlock({
            signature: signature,
            transactionBlock: bytes,
            requestType: 'WaitForLocalExecution',
            options: {
                showEffects: true
            }
        });
        resolve(result)
    } catch (error) {
        reject(error)
    }
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
//    const SUI_MNEMONIC = readlineSync.question('Nhap 12 tu khoa  ');
//    if (!SUI_MNEMONIC) {
//        console.log(chalk.red('Please input the correct mnemonic.'));
//        process.exit(0);
//    }

//    const amountToSend = readlineSync.question('Nhap so luong SUI can chuyen (vi du: 0.1) ');
//    const amountToSendCleaned = amountToSend.replace(',', '.');
//    if (isNaN(parseFloat(amountToSendCleaned))) {
//        console.log(chalk.red('Please input a valid amount.'));
//        process.exit(0);
//    }

    //const secret_key_mnemonics = SUI_MNEMONIC;
    const keypair = Ed25519Keypair.deriveKeypair(secret_key_mnemonics);
    const suiAddress = keypair.getPublicKey().toSuiAddress();

    const client = new SuiClient({
        url: getFullnodeUrl('mainnet'),
    });

    const amountToSendParsed = parseAmount(amountToSendCleaned, 9);

    // Check sender balance
    const senderBalanceResult = await client.getBalance({
        owner: suiAddress,
        coinType: "0x2::sui::SUI"
    });
    const realSenderBalance = calculateBalance(senderBalanceResult.totalBalance, 9);
    console.log(chalk.yellow(`Sender Address: ${suiAddress}`));
    console.log(chalk.yellow(`Sender Balance: ${realSenderBalance} SUI`));

    if (new BigNumber(realSenderBalance).lt(amountToSendCleaned * addresses.length)) {
        console.log(chalk.red('Insufficient balance to complete the transaction.'));
        process.exit(0);
    }

    for (const address of addresses) {
        const txb = new TransactionBlock();
        const canSendResult = await checkCanSend(suiAddress, amountToSendParsed, txb);

        if (!canSendResult) {
            console.log(chalk.red(`Insufficient balance to send ${amountToSend} SUI to ${address}`));
            continue;
        }

        txb.transferObjects([canSendResult], txb.pure(address));
        txb.setGasBudget("10000000"); // Ensure the gas budget is a string
        txb.setSender(suiAddress);

        try {
            const { bytes, signature } = await txb.sign({
                client,
                signer: keypair
            });

            const txResult = await sendTransaction(client, bytes, signature);
//            if (txResult.effects.status.status === 'success') {
//                console.log(chalk.green(`Successfully sent ${amountToSend} SUI to ${address}`));
//            } else {
//                console.log(chalk.red(`Failed to send ${amountToSend} SUI to ${address}`));
//            }
            await sleep(6000);
            if (txResult.effects.status.status === 'success') {
                console.log(chalk.green(`Đã gửi thành công ${amountToSendCleaned} SUI đến ${address}`));
                
                // Kiểm tra số dư sau khi gửi
                const newBalance = await client.getBalance({
                    owner: suiAddress,
                    coinType: "0x2::sui::SUI"
                });
                const realNewBalance = calculateBalance(newBalance.totalBalance, 9);
                console.log(chalk.yellow(`Số dư mới của người gửi: ${realNewBalance} SUI`));
            } else {
                console.log(chalk.red(`Không thể gửi ${amountToSendCleaned} SUI đến ${address}`));
            }
        } catch (error) {
            console.log(chalk.red(`Lỗi khi gửi ${amountToSendCleaned} SUI đến ${address}: ${error.message}`));
        }
        // Thêm độ trễ 2 giây trước lần lặp tiếp theo
        await delay(2000);
    }

    // Kiểm tra và in ra số dư cuối cùng sau khi hoàn thành tất cả giao dịch
    const finalBalance = await client.getBalance({
        owner: suiAddress,
        coinType: "0x2::sui::SUI"
    });
    const realFinalBalance = calculateBalance(finalBalance.totalBalance, 9);
    console.log(chalk.cyan(`Số dư cuối cùng của người gửi sau khi hoàn thành tất cả giao dịch: ${realFinalBalance} SUI`));
})();


