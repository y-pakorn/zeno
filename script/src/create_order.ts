import { client, contract, keypair } from "./constants";
import { Transaction } from "@mysten/sui/transactions";

(async () => {
  const market = contract.markets.longTermWal;

  const txb = new Transaction();

  const collateral = txb.splitCoins(txb.gas, [txb.pure.u64(50_000_000_000)]); // 50 SUI

  const isBuy = false;
  const canPartialFill = true;
  const rate = 460_000_000; // 0.46 wal per SUI

  txb.moveCall({
    target: `${contract.packageId}::zeno::create_order`,
    arguments: [
      txb.object(market),
      txb.object(contract.orderOwnerTable),
      txb.pure.bool(isBuy),
      collateral,
      txb.pure.u64(rate),
      txb.pure.bool(canPartialFill),
      txb.object("0x6"),
    ],
    typeArguments: ["0x2::sui::SUI"],
  });

  txb.setSender(keypair.toSuiAddress());

  const tx = await txb.build({
    client,
  });

  const simResult = await client.dryRunTransactionBlock({
    transactionBlock: tx,
  });

  if (simResult.effects.status.status !== "success") {
    console.error("Transaction failed", simResult);
    return;
  }

  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
  });

  const receipt = await client.waitForTransaction({
    digest: result.digest,
  });

  console.log("Place order successfully", receipt);
})();
