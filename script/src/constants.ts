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
      "0xa2ac3ad631f63c99a21f7f818648d67e864e74c7abe9ea5a04b2240950fb816d",
    adminCap:
      "0x3d97689fb4fceb15dfa122ac6b90fc0aae0bdf57d8492b89b5624732a2473f35",
    upgradeCap:
      "0x0ab9d3bcaf4918838484316fdbc8b6ffb7185f7f5b60a51524a27050bb470ff3",
    markets: {
      longTermWal:
        "0x6092b7e6440378b9c3717a446ea91efa27d4729bb88ab21fce245bced31fc005",
    },
  },
  mainnet: {},
};

export const contract = contracts[selectedNetwork];
