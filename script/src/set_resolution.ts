import { client, contract, keypair } from "./constants";
import { Transaction } from "@mysten/sui/transactions";

(async () => {
  const market = contract.markets.longTermWal;
  const txb = new Transaction();

  const start = Date.now();
  const end = start + 1000 * 60 * 10; // next 10 min

  txb.moveCall({
    target: `${contract.packageId}::zeno::set_resolution`,
    arguments: [
      txb.object(contract.adminCap),
      txb.object(market),
      txb.pure.u64(start),
      txb.pure.u64(end),
      txb.pure.u64(1_000_000_000),
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

  console.log("Set resolution successful", receipt);
  console.log("Start", start);
  console.log("End", end);
})();
