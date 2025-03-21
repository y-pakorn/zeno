import { client, contract, keypair } from "./constants";
import { Transaction } from "@mysten/sui/transactions";

(async () => {
  const market = contract.markets.longTermWal;
  const txb = new Transaction();

  txb.moveCall({
    target: `${contract.packageId}::zeno::set_collateral_type`,
    arguments: [
      txb.object(contract.adminCap),
      txb.object(market),
      txb.pure.u64(5_000_000_000), // 5 SUI
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

  console.log("Transaction successful", receipt);
})();
