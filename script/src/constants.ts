import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { decodeSuiPrivateKey, Keypair } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { configDotenv } from "dotenv";

configDotenv();

export const selectedNetwork = "devnet";

export const network = getFullnodeUrl(selectedNetwork);
export const client = new SuiClient({ url: network });

const secretKey = decodeSuiPrivateKey(process.env.PRIVATE_KEY || "").secretKey;
export const keypair = Ed25519Keypair.fromSecretKey(secretKey);

export const contracts = {
  devnet: {
    packageId:
      "0x7205f2c818f4c61abf9cde0941c6ced3e9fc414b3d13c4fef18440a8822afb85",
    adminCap:
      "0xe0245a6166fce6c4b6c2ac3aa257dad3ba517e0c184de0bfaface1f36db42ab7",
    upgradeCap:
      "0x2736532bc2b973dfe8f2b1dc2fe90dc6b43b02a48215a63a278cbc583e2465a1",
    markets: {
      longTermWal:
        "0x9fc7e3db566485b07fc025717c1414365c969b9c00cff9d996124f7aedc57943",
    },
  },
  mainnet: {},
};

export const contract = contracts[selectedNetwork];
