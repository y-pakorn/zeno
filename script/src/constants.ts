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
      "0x3a1a4e9883cc9d34bd7e02e288b243aa7befba69f2fa4842b954e5e7f5c112e8",
    adminCap:
      "0x405e10f5413d4ffe5b73fb24d3db81b6d2bea250ba7b44e094ecc7b5e254908b",
    upgradeCap:
      "0x302dde74c05f7b9abf9356ef449de74820eb7db94e2760972715337668638f79",
    orderOwnerTable:
      "0x0abc2d94a36d3780f5a3557c5b2c419c553eb6f1635550de1ebdd8b459d7933b",
    markets: {
      longTermWal:
        "0xe454be3a57c85bbe96e0e0ca7d6f8f96053d65558a4f6768f78c73f60bda92b5",
    },
  },
  mainnet: {},
};

export const contract = contracts[selectedNetwork];
