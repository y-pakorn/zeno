import { Transaction } from "@mysten/sui/transactions";
import { client, keypair, selectedNetwork } from "./constants";
import path from "node:path";
import { execSync } from "node:child_process";

(async () => {
  const marketName = "Ika";
  const collaterals = [
    {
      type: "0x2::sui::SUI",
      min: 1_000_000_000, // 1 SUI
    },
  ];
  const fees = [150, 150, 50, 150]; // 1.5%, 1.5%, 0.5%, 1.5%

  console.log(
    `Publishing and creating ${marketName} market on ${selectedNetwork}`
  );

  const contractURI = path.resolve(__dirname, "../../", "./contracts");
  const { modules, dependencies } = JSON.parse(
    execSync(`sui move build --dump-bytecode-as-base64 --path ${contractURI}`, {
      encoding: "utf-8",
    })
  );

  const tx = new Transaction();
  const uc = tx.publish({ modules, dependencies });
  tx.transferObjects([uc], keypair.getPublicKey().toSuiAddress());

  const result = await client.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
  });

  const receipt = await client.waitForTransaction({
    digest: result.digest,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  const packageId = receipt.objectChanges?.find(
    (o) => o.type === "published"
  )?.packageId;
  const adminCap = (
    receipt.objectChanges?.find(
      (o) =>
        o.type === "created" &&
        o.objectType === `${packageId}::zeno::PremarketAdminCap`
    ) as any
  ).objectId;
  const upgradeCap = (
    receipt.objectChanges?.find(
      (o) => o.type === "created" && o.objectType === `0x2::package::UpgradeCap`
    ) as any
  ).objectId;

  console.log("MARKET DETAILS FOR ", marketName);
  console.log("--------------------------------");
  console.log("Publish tx hash:", result.digest);
  console.log("Package ID:", packageId);
  console.log("Admin Cap:", adminCap);
  console.log("Upgrade Cap:", upgradeCap);

  const txb = new Transaction();

  txb.moveCall({
    target: `${packageId}::zeno::create_premarket`,
    arguments: [
      txb.object(adminCap),
      txb.pure.string(marketName),
      txb.pure.u64(fees[0]),
      txb.pure.u64(fees[1]),
      txb.pure.u64(fees[2]),
      txb.pure.u64(fees[3]),
      txb.pure.address(keypair.toSuiAddress()), // fee address
      txb.object("0x6"),
    ],
  });

  const createResult = await client.signAndExecuteTransaction({
    transaction: txb,
    signer: keypair,
  });

  const createReceipt = await client.waitForTransaction({
    digest: createResult.digest,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  const marketId = (
    createReceipt.objectChanges?.find(
      (o) =>
        o.type === "created" && o.objectType === `${packageId}::zeno::PreMarket`
    ) as any
  ).objectId;

  console.log("Create tx hash:", createResult.digest);
  console.log("Market ID:", marketId);

  const txb2 = new Transaction();

  for (const collateral of collaterals) {
    txb2.moveCall({
      target: `${packageId}::zeno::set_collateral_type`,
      arguments: [
        txb2.object(adminCap),
        txb2.object(marketId),
        txb2.pure.u64(collateral.min),
      ],
      typeArguments: [collateral.type],
    });
  }

  const setCollatResult = await client.signAndExecuteTransaction({
    transaction: txb2,
    signer: keypair,
  });

  const setCollatReceipt = await client.waitForTransaction({
    digest: setCollatResult.digest,
  });

  console.log("Set collateral tx hash:", setCollatResult.digest);
})();
