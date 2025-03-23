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
      "0xb0e9f4ea46291140f0e2b333b926a0428d9940c484194c2f83a80505aeccce64",
    adminCap:
      "0x9bfe73de40d38e35dbec1a58fdcca85c0e4dec0ded2641966b39987c8956983f",
    upgradeCap:
      "0x5a478aac774d502b4ffa6ecae42839a5a6c515230637e4939ece869a8ec16549",
    markets: {
      longTermWal:
        "0xbf08ab9c43f930593237084550f7d4daf9b9663785d5053665941e296168fb30",
    },
  },
  mainnet: {},
};

export const contract = contracts[selectedNetwork];
