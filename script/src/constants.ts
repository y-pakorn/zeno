import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { decodeSuiPrivateKey, Keypair } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { configDotenv } from "dotenv";

configDotenv();

export const selectedNetwork = "mainnet";

export const network = getFullnodeUrl(selectedNetwork);
export const client = new SuiClient({ url: network });

const secretKey = decodeSuiPrivateKey(process.env.PRIVATE_KEY || "").secretKey;
export const keypair = Ed25519Keypair.fromSecretKey(secretKey);

export const contracts = {
  devnet: {
    packageId:
      "0x1307b9af92bba561acb73780d9b4efa80255c7ba7f1d60c8373261e84afd7e3e",
    adminCap:
      "0xe91ffe81a806929fd94660459fda022f2db7f5783abc5329df276c0df56d1c0e",
    upgradeCap:
      "0xc5b69268977a8e250826e9e8bae338a5a1de4d82723f8e1606c50ed8da46c46d",
    markets: {
      walrus:
        "0x0f21634b863903e29c66a1aeefd42dfb747e46f6805699d3cfa69db538f05d96",
    },
  },
  mainnet: {
    packageId:
      "0xdfc9db75d42dfb4980016d1c623a5f325881d647d96fb9ce962830aaf41a6dbf",
    adminCap:
      "0x50aa98ddf9273ee27b2975cddaa1a14667826613a1acbed63beaa0443e4666e8",
    upgradeCap:
      "0x0818a332b47c8c91ba1bf0363598aa16e8e74bf4d6e5ff4a3aa5ea34c9af2c4b",
    markets: {
      walrus:
        "0x00a44a9bf8ed5196f47c462cfe3edd03d6b55646c29101da9507328225ac3ae8",
    },
  },
};

export const contract = contracts[selectedNetwork];
