import { client, contract, keypair } from "./constants";
import { Transaction } from "@mysten/sui/transactions";

(async () => {
  const txb = new Transaction();

  txb.moveCall({
    target: `${contract.packageId}::zeno::create_premarket`,
    arguments: [
      txb.object(contract.adminCap),
      txb.pure.string("LONG TERM WAL TEST"),
      txb.pure.u64(200), // 2% in bps
      txb.pure.u64(200), // 2% in bps
      txb.pure.u64(0), // 0% in bps
      txb.pure.u64(200), // 2% in bps
      txb.pure.address(keypair.toSuiAddress()), // fee address
      txb.object("0x6"),
    ],
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
    options: {
      showEvents: true,
      showObjectChanges: true,
    },
  });

  const marketId = (
    receipt.objectChanges!.find(
      (c) =>
        c.type === "created" &&
        c.objectType === `${contract.packageId}::zeno::PreMarket`
    ) as any
  ).objectId as string;

  console.log("Market created", marketId);
})();
