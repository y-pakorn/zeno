import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { decodeSuiPrivateKey, Keypair } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { configDotenv } from "dotenv";

configDotenv();

export const selectedNetwork = "testnet";

export const network = getFullnodeUrl(selectedNetwork);
export const client = new SuiClient({ url: network });

const secretKey = decodeSuiPrivateKey(process.env.PRIVATE_KEY || "").secretKey;
export const keypair = Ed25519Keypair.fromSecretKey(secretKey);
