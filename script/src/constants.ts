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
      "0x73571d4383a118e1190373bc5c193a428eaca5d3d07a1f612bf171918b58b8a3",
    adminCap:
      "0xbab1b01a034d47cf6fb7ec4253213234b15b640253af3c09163fc76e72be1e15",
    upgradeCap:
      "0xa766b93d894c6e39f0ad1e84e698cd7a282fb9b192b76f912bdae268be60cf4d",
    orderOwnerTable:
      "0x50d137b2b8d69d875fd8cb8db69ea186bb4e0a10e52ca1a3d9cb4b17389a6ca2",
    markets: {
      longTermWal:
        "0x98df2875040e034c88572c65ebc7fc8e94946dcf220b25804bdf2ccb4e12fdde",
    },
  },
  mainnet: {},
};

export const contract = contracts[selectedNetwork];
