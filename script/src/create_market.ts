import { client, contract, contracts, keypair } from "./constants";
import { Transaction } from "@mysten/sui/transactions";

(async () => {
  const txb = new Transaction();

  txb.moveCall({
    target: `${contract.packageId}::zeno::create_premarket`,
    arguments: [
      txb.object(contract.adminCap),
      txb.pure.string("WAL"),
      txb.pure.u64(150), // 1.5% in bps
      txb.pure.u64(150), // 1.5% in bps
      txb.pure.u64(50), // 0.5% in bps
      txb.pure.u64(150), // 1.5% in bps
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
        c.objectType === `${contract.packageId}::zeno::PreMarket`,
    ) as any
  ).objectId as string;

  console.log("Market created", marketId);

  const txb2 = new Transaction();

  txb2.moveCall({
    target: `${contract.packageId}::zeno::set_collateral_type`,
    arguments: [
      txb2.object(contract.adminCap),
      txb2.object(marketId),
      txb2.pure.u64(5_000_000_000), // 5 SUI
    ],
    typeArguments: ["0x2::sui::SUI"],
  });

  txb2.moveCall({
    target: `${contract.packageId}::zeno::set_collateral_type`,
    arguments: [
      txb2.object(contract.adminCap),
      txb2.object(marketId),
      txb2.pure.u64(10_000_000_000), // 10 USDC
    ],
    typeArguments: [
      "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC",
    ],
  });

  txb2.setSender(keypair.toSuiAddress());

  const tx2 = await txb2.build({
    client,
  });

  const simResult2 = await client.dryRunTransactionBlock({
    transactionBlock: tx2,
  });

  if (simResult2.effects.status.status !== "success") {
    console.error("Transaction failed", simResult2);
    return;
  }

  const result2 = await client.signAndExecuteTransaction({
    transaction: tx2,
    signer: keypair,
  });

  const receipt2 = await client.waitForTransaction({
    digest: result2.digest,
  });

  console.log("Set collateral types successful", receipt2);
})();
